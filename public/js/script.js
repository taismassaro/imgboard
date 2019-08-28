///// FRONT END - VUE.JS /////

(function() {
    ///// MAIN VUE INSTANCE /////
    new Vue({
        el: "main",
        data: {
            showModal: false,
            imgId: "",

            images: [],

            form: {
                title: "",
                description: "",
                username: "",
                file: null
            },

            uploaded: ""
        },
        mounted: function() {
            // must be a normal function so we can still have access to "this"
            console.log("Vue is mounted.");
            var that = this;
            axios
                .get("/images")
                .then(function(dbImages) {
                    that.images = dbImages.data;
                })
                .catch(function(error) {
                    console.log("Error fetching images:", error);
                });
        },
        methods: {
            submitInput: function(event) {
                event.preventDefault();
                console.log("Clicked submit button.");
                console.log("this:", this);

                var formData = new FormData();
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                formData.append("file", this.form.file);

                var that = this;
                axios
                    .post("/upload", formData)
                    .then(function(res) {
                        console.log("Response from POST /upload:", res);
                        var img = res.data;
                        that.images.unshift(img);
                        that.uploaded = "";
                        console.log("Array of images:", that.images);
                    })
                    .catch(function(error) {
                        console.log("Error in POST /upload", error);
                    });
            },
            uploadFile: function(event) {
                console.log("Upload file event.");
                console.log("File:", event.target.files[0]);
                this.form.file = event.target.files[0];
                this.uploaded = event.target.files[0].name;
            },
            toggleModal: function(imgId) {
                if (this.showModal === false) {
                    this.imgId = imgId;
                    console.log("Current Image:", imgId);
                    this.showModal = true;
                } else {
                    this.showModal = false;
                }
            }
        }
    });

    ///// VUE COMPONENT /////

    Vue.component("img-modal", {
        // data, methods, mounted
        template: "#modal-template",
        props: ["imgId", "showModal"],

        data: function() {
            return {
                currentImg: "",
                comments: {
                    username: "",
                    comment: ""
                }
            };
        },

        mounted: function() {
            // runs when the html is loaded
            console.log("Vue component is mounted.");
            console.log("Component's this:", this);
            console.log("Current Image:", this.imgId);
            var that = this;
            axios
                .get(`/modal/${this.imgId}`)
                .then(function(dbData) {
                    console.log("Modal data:", dbData.data);
                    that.currentImg = dbData.data;
                })
                .catch(function(error) {
                    console.log("Error fetching modal data:", error);
                });
        },

        methods: {
            hideModal: function() {
                this.$emit("hide");
                console.log("hideModal triggered");
            }
            // event handlers (only runs when the user interacts with the page)
        }
    });
})();
