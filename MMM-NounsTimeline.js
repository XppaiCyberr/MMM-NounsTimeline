Module.register("MMM-NounsTimeline", {
    // Default module config.
    defaults: {
        updateInterval: 5 * 60 * 1000, // 5 minutes
        animationSpeed: 1000,
        maxCasts: 20,
        displayCount: 5,
        cycleInterval: 10 * 1000 // 10 seconds per cycle
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.loaded = false;
        this.casts = [];
        this.currentIndex = 0;
        this.sendSocketNotification("CONFIG", this.config);
        this.updateDom(this.config.animationSpeed);
        
        // Start cycling through casts
        setInterval(() => {
            if (this.loaded && this.casts.length > this.config.displayCount) {
                this.currentIndex = (this.currentIndex + this.config.displayCount) % this.casts.length;
                this.updateDom(this.config.animationSpeed);
            }
        }, this.config.cycleInterval);
    },

    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
        if (notification === "CASTS") {
            this.casts = payload;
            this.loaded = true;
            this.currentIndex = 0;
            this.updateDom(this.config.animationSpeed);
        }
    },

    // Override dom generator.
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "MMM-NounsTimeline";

        if (!this.loaded) {
            wrapper.innerHTML = "Loading Nouns casts...";
            return wrapper;
        }

        const castsContainer = document.createElement("div");
        castsContainer.className = "casts-container";

        // Get the current slice of casts to display
        const startIndex = this.currentIndex;
        const endIndex = Math.min(startIndex + this.config.displayCount, this.casts.length);
        const currentCasts = this.casts.slice(startIndex, endIndex);

        currentCasts.forEach(cast => {
            const castElement = document.createElement("div");
            castElement.className = "cast";
            
            const authorInfo = document.createElement("div");
            authorInfo.className = "author-info";
            authorInfo.innerHTML = `
                <img src="${cast.author.pfp_url}" class="author-pfp" alt="${cast.author.username}">
                <span class="author-name">${cast.author.username}</span>
                <span class="follower-count">${cast.author.follower_count} followers</span>
            `;
            
            const castText = document.createElement("div");
            castText.className = "cast-text";
            castText.innerHTML = cast.text;
            
            const castFooter = document.createElement("div");
            castFooter.className = "cast-footer";
            
            const engagementMetrics = document.createElement("div");
            engagementMetrics.className = "engagement-metrics";
            engagementMetrics.innerHTML = `
                <span class="engagement-metric">
                    <i class="fas fa-heart"></i> ${cast.reactions?.likes_count || 0}
                </span>
                <span class="engagement-metric">
                    <i class="fas fa-comment"></i> ${cast.replies?.count || 0}
                </span>
            `;
            
            const timestamp = document.createElement("div");
            timestamp.className = "timestamp";
            timestamp.innerHTML = new Date(cast.timestamp).toLocaleString();
            
            castFooter.appendChild(engagementMetrics);
            castFooter.appendChild(timestamp);
            
            castElement.appendChild(authorInfo);
            castElement.appendChild(castText);
            castElement.appendChild(castFooter);
            castsContainer.appendChild(castElement);
        });

        // Add cycle indicator if there are more casts
        if (this.casts.length > this.config.displayCount) {
            const cycleIndicator = document.createElement("div");
            cycleIndicator.className = "cycle-indicator";
            cycleIndicator.innerHTML = `Showing ${startIndex + 1}-${endIndex} of ${this.casts.length} casts`;
            wrapper.appendChild(cycleIndicator);
        }

        wrapper.appendChild(castsContainer);
        return wrapper;
    },

    // Add styles
    getStyles: function() {
        return ["MMM-NounsTimeline.css", "font-awesome.css"];
    }
}); 