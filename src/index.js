var React = require('react');
var openpublish = require('openpublish');
var bitstore = require('bitstore');

var ImagePublisher = React.createClass({
  displayName: 'ImagePublisher',
  propTypes: {
    commonBlockchain: React.PropTypes.object.isRequired,
    commonWallet: React.PropTypes.object.isRequired
  },
  getInitialState: function() {
    return {
      signedPayload: false,
      fileInfo: false,
      fileDropState: false,
      payloadsLength: 0,
      propagationStatus: ""
    }
  },
  registerWithOpenPublish: function() {
    this.setState({
      fileDropState: "publishing"
    });
  },
  uploadToBitstore: function() {
    var component = this;
    var onStartUploadToBitstore = this.props.onStartUploadToBitstore;
    var onEndUploadToBitstore = this.props.onEndUploadToBitstore;
    var commonWallet = this.props.commonWallet;
    var bitstoreClient = bitstore(commonWallet);
    var fileInfo = this.state.fileInfo;
    var fileDropState = this.state.fileDropState;
    if (fileDropState != "scanned") {
      return;
    }
    this.setState({
      fileDropState: "uploading"
    });
    if (onStartUploadToBitstore) {
      onStartUploadToBitstore(false, {
        fileInfo: fileInfo
      });
    }
    bitstoreClient.files.put(fileInfo.file, function(error, res) {
      var bitstoreMeta = res.body;
      component.setState({
        bitstoreStatus: "new",
        bitstoreMeta: bitstoreMeta,
        fileDropState: "uploaded"
      })
      if (onEndUploadToBitstore) {
        onEndUploadToBitstore(false, {
          bitstoreMeta: bitstoreMeta
        });
      }
    });
  },
  dragOver: function (event) {
    event.stopPropagation();
    event.preventDefault();
  },
  dragEnd: function(event) {
    event.stopPropagation();
    event.preventDefault();
  },
  drop: function(event) {
    if (typeof(FileReader) == "undefined") {
      var FileReader = this.props.FileReader;
    }
    event.preventDefault();
    var component = this;
    var file = event.dataTransfer.files[0];
    component.setState({
      fileDropState: "scanning"
    });
    var reader = new FileReader();
    reader.onload = function (event) {
      var fileData = event.target.result;
      var fileInfo = {
        file: file,
        fileData: fileData
      };
      component.setState({
        fileDropState: "scanned",
        fileInfo: fileInfo
      });
      if (component.props.onFileDrop) {
        component.props.onFileDrop(false, fileInfo);
      }
    };
    reader.readAsBinaryString(file);
    var preview  = new FileReader();
    preview.onload = function (event) {
      var imagePreviewDataURL = event.target.result;
      component.setState({
        imgPreviewDataURL: imagePreviewDataURL
      });
      if (component.props.onImagePreviewDataURL) {
        component.props.onImagePreviewDataURL(false, imagePreviewDataURL);
      }
    }
    preview.readAsDataURL(file);
  },
  render: function () {
    var fileDropState = this.state.fileDropState;
    var imgPreview = this.state.imgPreviewDataURL ? <img className="image-preview" src={this.state.imgPreviewDataURL} /> : false;
    return (
      <div className='react-image-publisher'>
        <div className="file-drop-area" onDragOver={this.dragOver} onDragEnd={this.dragEnd} onDrop={this.drop}>
          <div className="fileDropState">{fileDropState || "drop file"}</div>
          {imgPreview}
        </div>
        <button className='upload-to-bitstore' onClick={this.uploadToBitstore}>Upload To Bitstore</button>
        <button className='register-with-openpublish' onClick={this.registerWithOpenPublish}>Register With Open Publish</button>
      </div>
    )
  }
});

module.exports = ImagePublisher