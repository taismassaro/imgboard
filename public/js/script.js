///// FRONT END - VUE.JS /////

(function() {
    ///// MAIN VUE INSTANCE /////
    new Vue({
        el: "main",
        data: {
            showModal: false,
            imgId: location.hash.slice(1),

            images: [],

            form: {
                title: "",
                description: "",
                username: "",
                file: null
            },

            uploaded: "",
            lastId: ""
        },
        mounted: function() {
            // must be a normal function so we can still have access to "this"
            console.log("Vue is mounted.");
            var that = this;

            axios
                .get("/images")
                .then(function(dbImages) {
                    that.images = dbImages.data;
                    var lastIndex = that.images.length - 1;
                    that.lastId = that.images[lastIndex].id;
                    console.log("lastId", that.lastId);
                })
                .catch(function(error) {
                    console.log("Error fetching images:", error);
                });

            addEventListener("hashchange", function() {
                var hashId = parseInt(location.hash.slice(1));

                console.log("hashId:", typeof hashId);
                console.log("isNaN:", isNaN(hashId));

                if (typeof hashId === "number" && isNaN(hashId) === false) {
                    console.log("SHOW MODAL");
                    that.imgId = location.hash.slice(1);
                    that.showModal = true;
                }
            });

            this.scroll();
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
                        that.form = {
                            title: "",
                            description: "",
                            username: "",
                            file: null
                        };
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
            hideModal: function() {
                if (this.showModal === true) {
                    this.showModal = false;
                    location.hash = "";
                }
            },
            scroll: function() {
                var scrolling = false;
                var bottom = function() {
                    return (
                        document.documentElement.scrollTop +
                            window.innerHeight ===
                        document.documentElement.offsetHeight
                    );
                };
                window.onscroll = function() {
                    scrolling = true;
                };
                var that = this;

                setInterval(function() {
                    if (scrolling) {
                        scrolling = false;
                        if (bottom()) {
                            console.log("that in scroll():", that);
                            axios
                                .get(`/images/${that.lastId}`)
                                .then(function(dbImages) {
                                    console.log(
                                        "dbImages in scroll:",
                                        dbImages
                                    );
                                    dbImages.data.forEach(function(image) {
                                        that.images.push(image);
                                    });
                                    var lastIndex = that.images.length - 1;
                                    that.lastId = that.images[lastIndex].id;
                                    console.log("lastId", that.lastId);
                                })
                                .catch(function(error) {
                                    console.log(
                                        "Error fetching images:",
                                        error
                                    );
                                });
                        }
                    }
                }, 500);
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

                comments: [],

                form: {
                    username: "",
                    comment: ""
                }
            };
        },

        mounted: function() {
            // runs when the html is loaded
            console.log("Vue component is mounted.");
            console.log("Component's this:", this);
            // console.log("Current Image:", this.imgId);
            var that = this;
            axios
                .get(`/modal/${this.imgId}`)
                .then(function(dbData) {
                    console.log("Modal data:", dbData.data);
                    let { comments, image } = dbData.data;
                    that.comments = comments;
                    that.currentImg = image;
                })
                .catch(function(error) {
                    console.log("Error fetching modal data:", error);
                });
        },

        watch: {
            // watches for changes in the instance props
            imgId: function() {
                // do the same thing as in mounted (request the data and show them in the modal)
                console.log("imgId changed in the instance:", this.imgId);
            }
        },

        methods: {
            // event handlers (only runs when the user interacts with the page)
            hideModal: function() {
                this.$emit("hide");
                console.log("hideModal triggered");
            },
            sendComment: function(event) {
                event.preventDefault();
                console.log("Submit comment.");
                console.log("this:", this);

                var that = this;
                axios
                    .post(`/comments/${that.imgId}`, that.form)
                    .then(function(res) {
                        console.log("Response from POST /comments:", res);
                        var comment = res.data;
                        that.comments.unshift(comment);
                        console.log("All comments:", that.comments);
                        that.form = {
                            username: "",
                            comment: ""
                        };
                    })
                    .catch(function(error) {
                        console.log("Error in POST /comments", error);
                    });
            }
        }
    });
})();
