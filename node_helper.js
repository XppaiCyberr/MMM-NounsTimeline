const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CONFIG") {
            this.config = payload;
            this.fetchCasts();
            setInterval(() => {
                this.fetchCasts();
            }, this.config.updateInterval);
        }
    },

    async fetchCasts() {
        try {
            const response = await axios.get('https://api.pinata.cloud/v3/farcaster/casts', {
                params: {
                    channel: 'nouns'
                },
                headers: {
                    'Authorization': `Bearer ${this.config.pinataJWT}`,
                    'Content-Type': 'application/json'
                }
            });

            this.sendSocketNotification("CASTS", response.data.casts);
        } catch (error) {
            console.error("Error fetching Nouns casts:", error.message);
        }
    }
}); 