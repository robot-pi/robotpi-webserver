document.addEventListener("DOMContentLoaded", function() {
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const clientIdElement = document.getElementById('clientId');
    const answerButton = document.getElementById('answerButton');
    const rejectButton = document.getElementById('rejectButton');
    const endCallButton = document.getElementById('endCallButton');
    const clientsDiv = document.getElementById('clients');

    let localStream;
    let peerConnection;
    let incomingCall = null;
    let incomingOffer = null;
    const iceCandidateQueue = [];
    const signalingServerUrl = `wss://${window.location.hostname}:8080/signaling`;
    const signalingServer = new WebSocket(signalingServerUrl);
    let clientId;
    let hostId;
    let targetId; // Define targetId to store the ID of the client being called

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    signalingServer.onopen = async () => {
        console.log('Connected to signaling server');
        await fetchClientId();
        signalingServer.send(JSON.stringify({
            type: 'register',
            source: clientId
        }));
        fetchClients();
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
    setInterval(fetchClients, 3001)


    async function fetchClientId() {
        try {
            const response = await fetch('/api/users/doctors');
            const client = await response.json();
            clientId = client.id;
            if (clientIdElement) {
                clientIdElement.textContent = clientId;
            } else {
                console.error('clientIdElement is not found in the DOM.');
            }
            console.log('Client ID:', clientId);
        } catch (error) {
            console.error('Error fetching client ID:', error);
            document.getElementById('errorMessage').textContent = 'Error fetching client ID: ' + error.message;
        }
    }

    async function fetchClients() {
        try {
            console.error('start fetching clients...');
            const response = await fetch('/api/users/role/patient');
            const clients = await response.json();
            console.info(clients);
            if (clientsDiv) {
                clientsDiv.innerHTML = '';
                clients.forEach(client => {
//                    if (client.id !== clientId && client.status === 'online') {
                    if (client.id !== clientId) {
                        const clientDiv = document.createElement('div');
                        clientDiv.className = 'client';
                        const statusClass = client.availabilityStatus === 'available' ? 'Available' : 'Unavailable';
                        const statusText = client.availabilityStatus === 'available' ? 'Available' : 'Unavailable';

                        if (client.availabilityStatus === 'available') {
                            clientDiv.innerHTML = `
                                <p>Client ID: ${client.id} <span class="${statusClass}">(${statusText})</span></p>
                                <button onclick="callClient('${client.id}')">Call</button>
                                <button onclick="checkClientStatus('${client.id}')">Status</button>
                            `;
                        } else {
                            clientDiv.innerHTML = `
                                <p>Client ID: ${client.id} <span class="${statusClass}">(${statusText})</span></p>
                                <button onclick="checkClientStatus('${client.id}')">Status</button>
                            `;
                        }

//                        clientDiv.addEventListener('click', () => {
//                            window.location.href = `client_status.html?clientId=${client.id}`;
//                        });
                        clientsDiv.appendChild(clientDiv);
                    }
                });
            } else {
                console.error('clientsDiv is not found in the DOM.');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            document.getElementById('errorMessage').textContent = 'Error fetching clients: ' + error.message;
        }
    }

    async function fetchHostId() {
        try {
            const response = await fetch('/api/users/doctors');
            const host = await response.json();
            if (host) {
                hostId = host.id;
                console.log('Host ID:', hostId);
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

    function checkClientStatus(id) {
        window.location.href = `client_status.html?clientId=${id}`;
    }

    window.callHost = callHost; // Expose callHost function to the global scope
    window.callClient = callClient; // Expose callClient function to the global scope
    window.answerCall = answerCall; // Expose answerCall function to the global scope
    window.rejectCall = rejectCall; // Expose rejectCall function to the global scope
    window.endCall = endCall; // Expose endCall function to the global scope
    window.checkClientStatus = checkClientStatus;
});
