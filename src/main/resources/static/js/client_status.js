document.addEventListener("DOMContentLoaded", function() {
    const clientId = new URLSearchParams(window.location.search).get('clientId');
    const clientIdElement = document.getElementById('clientId');
    const currentBodyTemperatureElement = document.getElementById('currentBodyTemperature');
    const currentPulseRateElement = document.getElementById('currentPulseRate');
    const statusHistoryDiv = document.getElementById('statusHistory');
    const errorMessageElement = document.getElementById('errorMessage');

    if (!clientId) {
        errorMessageElement.textContent = 'Client ID is missing.';
        return;
    }

    clientIdElement.textContent = clientId;

    async function fetchClientStatus() {
        try {
            const response = await fetch(`/api/status/history/${clientId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch client status history');
                console.error('Failed to fetch client status history.');
            }

            const statusHistory = await response.json();
            console.info(statusHistory);
            if (statusHistory.length > 0) {

                const latestStatus = statusHistory[statusHistory.length - 1];
                currentBodyTemperatureElement.textContent = latestStatus.bodyTemperature;
                currentPulseRateElement.textContent = latestStatus.pulseRate;

                statusHistory.forEach(status => {
                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'status-entry';
                    statusDiv.innerHTML = `
                        <p>Timestamp: ${new Date(status.timestamp).toLocaleString()}</p>
                        <p>Body Temperature: ${status.bodyTemperature} °C</p>
                        <p>Pulse Rate: ${status.pulseRate} bpm</p>
                    `;
                    statusHistoryDiv.appendChild(statusDiv);
                });
            } else {
                errorMessageElement.textContent = 'No status history found for this client.';
            }
        } catch (error) {
            errorMessageElement.textContent = 'Error fetching client status history: ' + error.message;
        }
    }

    fetchClientStatus();

    // Add the returnToHost function
    window.returnToHost = function() {
        window.location.href = 'host.html';
    };
});
