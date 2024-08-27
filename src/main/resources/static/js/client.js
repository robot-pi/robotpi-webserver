document.addEventListener("DOMContentLoaded", function() {
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const clientIdElement = document.getElementById('clientId');
    const clientIdInput = document.getElementById('clientIdInput');
    const passwordInput = document.getElementById('passwordInput');
    const callHostButton = document.getElementById('callHostButton'); // Only in client.html
    const answerButton = document.getElementById('answerButton');
    const rejectButton = document.getElementById('rejectButton');
    const endCallButton = document.getElementById('endCallButton');
    const logoutButton = document.getElementById('logoutButton');
    const clientsDiv = document.getElementById('clients');
    const bodyTemperatureInput = document.getElementById('bodyTemperature');
    const pulseRateInput = document.getElementById('pulseRate');

    let localStream;
    let peerConnection;
    let incomingCall = null;
    let incomingOffer = null;
    const iceCandidateQueue = [];
    const signalingServerUrl = `wss://${window.location.hostname}:8080/signaling`;
    let signalingServer;
    let clientId;
    let hostId;
    let targetId; // Define targetId to store the ID of the client being called

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    async function login() {
        const clientIdValue = clientIdInput.value;
        const passwordValue = passwordInput.value;

        if (clientIdValue && passwordValue) {
            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: clientIdValue, password: passwordValue })
                });

                if (!response.ok) {
                    throw new Error('Invalid login credentials');
                }

                const client = await response.json();
                clientId = client.id;
                clientIdElement.textContent = clientId;
                startWebSocketConnection();
//                updateClientStatus(clientId, "online"); // Update client status to "online"
                loginButton.style.display = 'none'; // Hide login button
                clientIdInput.style.display = 'none'; // Hide clientIdInput
                passwordInput.style.display = 'none'; // Hide passwordInput
                logoutButton.style.display = 'inline'; // Show logout button
            } catch (error) {
                console.error('Login failed:', error);
                document.getElementById('errorMessage').textContent = 'Login failed: ' + error.message;
            }
        } else {
            console.error('Client ID and password are required.');
            document.getElementById('errorMessage').textContent = 'Client ID and password are required.';
        }
    }

    async function updateClientStatus(clientId, status) {
        try {
            const response = await fetch('/api/clients/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clientId: clientId, status: status })
            });
            if (!response.ok) {
                throw new Error('Failed to update client status');
            }
            console.log('Client status updated to', status);
        } catch (error) {
            console.error('Error updating client status:', error);
            document.getElementById('errorMessage').textContent = 'Error updating client status: ' + error.message;
        }
    }

    function logout() {
        if (clientId) {
            updateClientStatus(clientId, "offline"); // Update client status to "offline"
            if (signalingServer) {
                signalingServer.close(); // Close WebSocket connection
            }
            clientIdElement.textContent = '';
            clientId = null;
            loginButton.style.display = 'inline'; // Show login button
            clientIdInput.style.display = 'inline'; // Show clientIdInput
            passwordInput.style.display = 'inline'; // Show passwordInput
            logoutButton.style.display = 'none'; // Hide logout button
            callHostButton.style.display = 'none';
            console.log('Logged out');
        } else {
            console.error('Client ID not found.');
            document.getElementById('errorMessage').textContent = 'Client ID not found.';
        }
    }

    function startWebSocketConnection() {
        signalingServer = new WebSocket(signalingServerUrl);
        signalingServer.onopen = async () => {
            console.log('Connected to signaling server');
            signalingServer.send(JSON.stringify({
                type: 'register',
                source: clientId
            }));
            fetchHostId();
        };

        signalingServer.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        signalingServer.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            console.log('Received message:', data);

            switch (data.type) {
                case 'call':
                    handleIncomingCall(data);
                    break;
                case 'offer':
                    handleOffer(data);
                    break;
                case 'answer':
                    await handleAnswer(data);
                    break;
                case 'candidate':
                    await handleCandidate(data);
                    break;
                case 'call_reject':
                    alert("Call rejected by the other client.");
                    break;
                case 'call_end':
                    handleCallEnd(data.source);
                    break;
                default:
                    console.error('Unknown message type:', data.type);
                    break;
            }
        };
    }

    async function fetchHostId() {
        try {
            const response = await fetch('/api/users/doctors');
            const host = await response.json();
            if (host) {
                hostId = host.id;
                console.log('Host ID:', hostId);
                if (callHostButton) {
                    callHostButton.style.display = 'inline'; // Show the call host button after login
                }
            } else {
                console.error('Host not found');
                document.getElementById('errorMessage').textContent = 'Host not found.';
            }
        } catch (error) {
            console.error('Error fetching host ID:', error);
            document.getElementById('errorMessage').textContent = 'Error fetching host ID: ' + error.message;
        }
    }

    function showCallButtons() {
        console.log('Showing call buttons');
        answerButton.style.display = 'inline';
        rejectButton.style.display = 'inline';
    }

    function hideCallButtons() {
        console.log('Hiding call buttons');
        answerButton.style.display = 'none';
        rejectButton.style.display = 'none';
    }

    function showEndCallButton() {
        console.log('Showing end call button');
        endCallButton.style.display = 'inline';
    }

    function hideEndCallButton() {
        console.log('Hiding end call button');
        endCallButton.style.display = 'none';
    }

    async function callClient(id) {
        targetId = id; // Set targetId when calling a client
        if (!targetId) {
            alert('Please enter a target client ID.');
            return;
        }

        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            console.log('Got local stream:', localStream);

            createPeerConnection();

            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            console.log('Added local stream tracks to peer connection');

            signalingServer.send(JSON.stringify({
                type: 'call',
                source: clientId,
                target: targetId
            }));
            console.log('Sent call request to:', targetId);

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log('Created and set local description with offer:', offer);

            signalingServer.send(JSON.stringify({
                type: 'offer',
                sdp: offer.sdp,
                source: clientId,
                target: targetId
            }));
            console.log('Sent offer:', offer);

            showEndCallButton();
        } catch (error) {
            console.error('Error accessing media devices.', error);
            document.getElementById('errorMessage').textContent = 'Error accessing media devices: ' + error.message;
        }
    }

    async function callHost() {
        targetId = hostId; // Set targetId to hostId when calling the host
        if (!hostId) {
            alert('Host ID not found.');
            return;
        }

        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            console.log('Got local stream:', localStream);

            createPeerConnection();

            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            console.log('Added local stream tracks to peer connection');

            signalingServer.send(JSON.stringify({
                type: 'call',
                source: clientId,
                target: hostId
            }));
            console.log('Sent call request to host:', hostId);

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log('Created and set local description with offer:', offer);

            signalingServer.send(JSON.stringify({
                type: 'offer',
                sdp: offer.sdp,
                source: clientId,
                target: hostId
            }));
            console.log('Sent offer to host:', offer);

            showEndCallButton();
        } catch (error) {
            console.error('Error accessing media devices.', error);
            document.getElementById('errorMessage').textContent = 'Error accessing media devices: ' + error.message;
        }
    }

    function handleIncomingCall(data) {
        console.log('Handling incoming call:', data);
        incomingCall = data;
        showCallButtons();
        console.log('Incoming call from:', data.source);
    }

    function handleOffer(data) {
        console.log('Handling offer:', data);
        incomingOffer = data;
        if (!peerConnection) {
            createPeerConnection();
        }
    }

    async function answerCall() {
        console.log('Answering call');
        hideCallButtons();
        if (!incomingCall) {
            console.error('No incoming call to answer.');
            return;
        }

        const targetId = incomingCall.source;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const errorMessage = 'WebRTC is not supported by this browser.';
            console.error(errorMessage);
            document.getElementById('errorMessage').textContent = errorMessage;
            return;
        }

        try {
            console.log('Requesting local stream');
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = localStream;
            console.log('Got local stream:', localStream);

            if (!peerConnection) {
                createPeerConnection();
            }

            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
            console.log('Added local stream tracks to peer connection');

            if (incomingOffer) {
                console.log('Setting remote description with offer:', incomingOffer.sdp);
                await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: incomingOffer.sdp }));
                console.log('Set remote description with offer');

                const answer = await peerConnection.createAnswer();
                console.log('Created answer:', answer.sdp);
                await peerConnection.setLocalDescription(answer);
                console.log('Set local description with answer');

                signalingServer.send(JSON.stringify({
                    type: 'answer',
                    sdp: answer.sdp,
                    source: clientId,
                    target: incomingOffer.source
                }));
                console.log('Sent answer:', answer);

                processQueuedIceCandidates();

                showEndCallButton();
            } else {
                console.error('No incoming offer to handle.');
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
            document.getElementById('errorMessage').textContent = 'Error accessing media devices: ' + error.message;
        }
    }

    function rejectCall() {
        hideCallButtons();
        if (incomingCall) {
            signalingServer.send(JSON.stringify({
                type: 'call_reject',
                source: clientId,
                target: incomingCall.source
            }));
            console.log('Rejected call from:', incomingCall.source);
            incomingCall = null;
        }
    }

    async function handleAnswer(data) {
        try {
            console.log('Handling answer:', data.sdp);
            await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
            console.log('Set remote description with answer');
            processQueuedIceCandidates();
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    async function handleCandidate(data) {
        try {
            console.log('Adding ICE candidate:', data.candidate);
            const candidate = new RTCIceCandidate(data.candidate);
            if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                await peerConnection.addIceCandidate(candidate);
                console.log('Added ICE candidate:', candidate);
            } else {
                console.warn('Queueing ICE candidate because peer connection is not yet ready');
                iceCandidateQueue.push(candidate);
            }
        } catch (error) {
            console.error('Error adding received ICE candidate', error);
        }
    }

    function handleCallEnd(source) {
        console.log('Handling call end from:', source);
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        hideEndCallButton();
        hideCallButtons(); // Ensure all buttons are hidden
        remoteVideo.srcObject = null;
        localVideo.srcObject = null;
        incomingCall = null; // Reset incoming call data
        incomingOffer = null; // Reset incoming offer data
        console.log('Call ended');

        // Restart WebSocket connection
        if (signalingServer) {
            signalingServer.close();
        }
        startWebSocketConnection();
    }

    function createPeerConnection() {
        peerConnection = new RTCPeerConnection(configuration);

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('Sending ICE candidate:', event.candidate);
                signalingServer.send(JSON.stringify({
                    type: 'candidate',
                    candidate: event.candidate,
                    source: clientId,
                    target: targetId // Use the correct targetId
                }));
            }
        };

        peerConnection.ontrack = event => {
            console.log('Received remote stream:', event.streams[0]);
            remoteVideo.srcObject = event.streams[0];
        };

        peerConnection.onconnectionstatechange = event => {
            console.log('Peer connection state change:', peerConnection.connectionState);
            if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
                console.log('Peer connection state is disconnected or failed. Ending call.');
                endCall();
            }
        };

        console.log('Created new peer connection');
    }

    function processQueuedIceCandidates() {
        console.log('Processing queued ICE candidates');
        iceCandidateQueue.forEach(async candidate => {
            try {
                await peerConnection.addIceCandidate(candidate);
                console.log('Added queued ICE candidate:', candidate);
            } catch (error) {
                console.error('Error adding queued ICE candidate:', error);
            }
        });
        iceCandidateQueue.length = 0; // Clear the queue
    }

    function endCall() {
        console.log('Ending call');
        signalingServer.send(JSON.stringify({
            type: 'call_end',
            source: clientId,
            target: targetId // Use the correct targetId
        }));
        handleCallEnd(clientId); // End the call locally
        console.log('Call ended and notification sent to other client');
    }

    async function uploadStatus() {
        const bodyTemperature = parseFloat(bodyTemperatureInput.value);
        const pulseRate = parseInt(pulseRateInput.value);

        if (isNaN(bodyTemperature) || isNaN(pulseRate)) {
            console.error('Invalid body temperature or pulse rate.');
            document.getElementById('errorMessage').textContent = 'Invalid body temperature or pulse rate.';
            return;
        }

        try {
            const response = await fetch('/api/status/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientId: clientId,
                    bodyTemperature: bodyTemperature,
                    pulseRate: pulseRate
                })
            });

            if (!response.ok) {
                throw new Error('Failed to upload status');
            }

            console.log('Status uploaded successfully');
        } catch (error) {
            console.error('Error uploading status:', error);
            document.getElementById('errorMessage').textContent = 'Error uploading status: ' + error.message;
        }
    }

    // Expose necessary functions to the global scope
    window.callHost = callHost;
    window.callClient = callClient;
    window.answerCall = answerCall;
    window.rejectCall = rejectCall;
    window.endCall = endCall;
    window.login = login; // Expose login function to the global scope
    window.logout = logout; // Expose logout function to the global scope
    window.uploadStatus = uploadStatus; // Expose uploadStatus function to the global scope

    // Fetch clients for the login dropdown
    fetchClients();
});
