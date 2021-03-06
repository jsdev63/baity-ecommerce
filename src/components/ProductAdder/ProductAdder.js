import React, { Component } from "react";
import firebase from "firebase";
import { database, storage } from "config/base";
import ProductForm from "components/ProductForm";

class ProductAdder extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.insertProduct = this.insertProduct.bind(this);
  }

  insertProduct(product, imgDownloadURL, formErrorViewer, formSuccessViewer) {
    const { state: { currentUser } } = this.props;

    try {
      var postListRef = database.ref("testProducts");
      var newPostRef = postListRef.push();
      newPostRef.set({
        category: product.cat.value,
        city: "الرياض",
        city_department: "",
        dataCreated: Date.now(),
        department: product.dept.value,
        desc: product.desc.value,
        height: product.height.value,
        id: newPostRef.key,
        imgUrl: imgDownloadURL,
        length: product.length.value,
        likes: "0",
        name: product.name.value,
        owner: currentUser.uid, //user id which is not yet implementd
        postType: "product",
        price: product.price.value,
        width: product.width.value,
        weight: product.weight.value
      })
        .then(() => {
          console.log('insesrt succeeded');
          formSuccessViewer();
        })
        .catch((error) => {
          console.log(`ERROR: code: ${error.code}, message:${error.message}`);
          formErrorViewer(error.message);
        });
      // formSuccessViewer();
    } catch (error) {
      console.log(`ERROR: code: ${error.code}, message:${error.message}`);
      formErrorViewer(error);
    }
  }

  handleSubmit(formData, formErrorViewer, formSuccessViewer, formPercentageViewer) {
    //value should be the value of state of the ProductForm
    //1- upload the image of the product.
    //2- add the product to the database
    //Check (https://firebase.google.com/docs/storage/web/upload-files) &
    //check (https://firebase.google.com/docs/database/web/read-and-write) for more info
    formData.newImages.map(file => {
      //get a reference for the image bucket (the placeholder where we will put the image into)
      var imagesRef = storage
        .ref()
        .child("testProductImages/" + Date.now() + Math.random());
      //upload the image. This is a task that will run async. Notice that it accepts a file as in
      //browser API File (see https://developer.mozilla.org/en-US/docs/Web/API/File)
      var metadata = {
        contentType: file.type
      };
      //The following will return a task that will execte async
      var uploadTask = imagesRef.put(file, metadata);
      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on(
        "state_changed",
        function (snapshot) {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
          formPercentageViewer(progress)
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log("Upload is paused");
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log("Upload is running");
              break;
          }
        },
        error => {
          // Handle unsuccessful uploads
          console.log("error uploading image of product");
          console.log(`ERROR: code: ${error.code}, message:${error.message}`);
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              break;

            case "storage/canceled":
              // User canceled the upload
              break;

            case "storage/unknown":
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
          formErrorViewer(error.message);
        },
        //use arrow function so that you can access this.insertProduct. See (https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback)
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          var imgDownloadURL = uploadTask.snapshot.downloadURL;
          console.log("upload sucessful and image URL is: " + imgDownloadURL);
          this.insertProduct(formData, imgDownloadURL, formErrorViewer, formSuccessViewer);
        }
      );
    });
  }

  render() {
    const { state: { currentUser } } = this.props;

    return (
      <div className="productAdding">
        <ProductForm currentUser={currentUser} isNewProduct={true} onSubmit={this.handleSubmit.bind(this)} />
      </div>
    );
  }
}

export default ProductAdder;
