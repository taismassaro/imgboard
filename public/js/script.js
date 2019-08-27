///// FRONT END - VUE.JS /////

(function() {
    new Vue({
        el: "main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            uploaded: ""
        },
        mounted: function() {
            // must be a normal function so we can still have access to "this"
            console.log("Vue is mounted.");
            var up = this;
            axios
                .get("/images")
                .then(function(response) {
                    up.images = response.data;
                })
                .catch(function(error) {
                    console.log("Error:", error);
                });
        },
        methods: {
            submitInput: function(event) {
                event.preventDefault();
                console.log("Clicked submit button.");
                console.log("this:", this);

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

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
                this.file = event.target.files[0];
                this.uploaded = event.target.files[0].name;
            }
        }
    });

    var fileInput = document.querySelector("input[name='file']"),
        label = fileInput.nextElementSibling,
        val = label.innerHTML;

    console.log("fileInput:", fileInput);
    console.log("label:", label);
    console.log("val:", val);

    fileInput.addEventListener("change", function(event) {
        console.log("input event:", event);
        // var filename = event.target.value;
    });
})();
