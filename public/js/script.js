///// FRONT END - VUE.JS /////

(function() {
    ///// MAIN VUE INSTANCE /////
    new Vue({
        el: "main",
        data: {
            imgId: location.hash.slice(1),

            images: [],

            form: {
                title: "",
                description: "",
                username: "",
                tags: "",
                file: null
            },

            uploading: "",
            uploaded: "",
            lastId: "",
            tag: ""
        },
        mounted: function() {
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
                if (typeof hashId === "number" && isNaN(hashId) === false) {
                    console.log("SHOW MODAL");
                    that.imgId = location.hash.slice(1);
                } else {
                    location.hash = "";
                    history.pushState({}, "", "/");
                }
            });
            this.randomUser();
            this.scroll();
        },
        methods: {
            uploadForm: function() {
                console.log("open upload form");
                this.uploading = true;
            },
            uploadImg: function(event) {
                event.preventDefault();
                console.log("Clicked submit button.");
                console.log("this:", this);
                console.log("tags:", this.form.tags);

                var formData = new FormData();
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);
                formData.append("username", this.form.username);
                formData.append("tags", this.form.tags);
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

                        that.randomUser();

                        that.uploading = false;
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
            hideModal: function(tag) {
                if (this.imgId) {
                    this.imgId = "";
                    location.hash = "";
                    history.pushState({}, "", "/");
                }
                if (tag) {
                    this.tag = tag;
                    var that = this;
                    axios
                        .get("/images/tags/" + tag)
                        .then(function(dbImages) {
                            that.images = dbImages.data;
                            var lastIndex = that.images.length - 1;
                            that.lastId = that.images[lastIndex].id;
                            console.log("lastId", that.lastId);
                        })
                        .catch(function(error) {
                            console.log("Error fetching images:", error);
                        });
                }
                console.log("tag from emit", tag);
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
            },
            randomUser: function() {
                var that = this;

                axios
                    .get("https://randomuser.me/api/?inc=login&noinfo")
                    .then(function(login) {
                        console.log(
                            "random user login:",
                            login.data.results[0].login.username
                        );
                        that.form.username =
                            login.data.results[0].login.username;
                    })
                    .catch(function(error) {
                        console.log("Error fetching random user:", error);
                    });
            }
        }
    });

    ///// VUE COMPONENT /////

    Vue.component("img-modal", {
        // data, methods, mounted
        template: "#modal-template",
        props: ["imgId"],

        data: function() {
            return {
                currentImg: "",

                comments: [],

                tags: [],

                form: {
                    username: "",
                    comment: ""
                },

                error: ""
            };
        },

        mounted: function() {
            console.log("Vue component is mounted.");
            console.log("Component's this:", this);
            this.loadData();
            this.randomUser();
        },

        watch: {
            // watches for changes in the instance props
            imgId: function() {
                if (this.imgId !== this.currentImg.id) {
                    this.loadData();
                }
            }
        },

        methods: {
            loadData: function() {
                var that = this;
                axios
                    .get(`/modal/${that.imgId}`)
                    .then(function(dbData) {
                        console.log("dbData", dbData);
                        if (dbData.data === false) {
                            that.error = "no image";
                        } else {
                            let { comments, image, tags } = dbData.data;
                            that.tags = tags;
                            that.comments = comments;
                            that.currentImg = image;
                            that.error = "";
                        }
                    })
                    .catch(function(error) {
                        console.log("Error fetching modal data:", error);
                    });
            },
            hideModal: function() {
                this.$emit("hide");
                console.log("hideModal triggered");
            },
            randomUser: function() {
                var that = this;

                axios
                    .get("https://randomuser.me/api/?inc=login&noinfo")
                    .then(function(login) {
                        console.log(
                            "random user login:",
                            login.data.results[0].login.username
                        );
                        that.form.username =
                            login.data.results[0].login.username;
                    })
                    .catch(function(error) {
                        console.log("Error fetching random user:", error);
                    });
            },
            showPrev: function() {
                location.hash = "#" + this.currentImg.prevId;
            },
            showNext: function() {
                location.hash = "#" + this.currentImg.nextId;
            },
            selectTag: function(tag) {
                console.log("tag in selectTag", tag);
                this.$emit("hide", tag);
            },
            sendComment: function(event) {
                event.preventDefault();
                console.log("Submit comment.");
                console.log("this:", this);

                var that = this;
                if (that.form.comment) {
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
                            that.randomUser();
                        })
                        .catch(function(error) {
                            console.log("Error in POST /comments", error);
                        });
                }
            }
        }
    });
})();
