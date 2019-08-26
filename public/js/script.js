(function() {
    new Vue({
        el: "#img-container",
        data: {
            images: []
        },
        mounted: function() {
            // must be a normal function so we can still have access to "this"
            console.log("Vue is mounted.");
            var up = this;
            axios
                .get("/images")
                .then(function(response) {
                    up.images = response.data;
                    console.log("this.planets", up.images);
                    console.log("This is the response:", response);
                })
                .catch(function(error) {
                    console.log("Error:", error);
                });
        },
        methods: {
            myFunc: function(planet) {
                console.log(`${planet} is the planet.`);
            }
        }
    });
})();
