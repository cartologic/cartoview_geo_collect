import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class FileForm extends Component {
  getValue(){
    return {file: this.input.files[0]};
  }
  render(){
    return (<div className="panel panel-default">
      <div className="panel-heading">Images</div>
      <div className="panel-body">
        <div className="form-group">
          <label>Image</label>
          <input type="file" ref={i => this.input = i} />
        </div>
      </div>
    </div>);
  }
}

class GeoForm extends Component {
  state = {}

  onSubmit = (e) => {
    e.preventDefault()
    const {uploadUrl} = this.props;
    const fileFormValue = this.fileForm.getValue();
    console.log(fileFormValue);
    const fd = new FormData();
    fd.append('file', fileFormValue.file, fileFormValue.file.name);
    fetch(uploadUrl, {
      method: 'POST',
      credentials: 'include',
      body: fd
    }).then(res => res.json()).then(res => {
      this.setState({
        saving: false
      })
    });

  }



  render() {
    const {xyValue, saving} = this.state;
    return (
      <div>
        <FileForm ref={f => this.fileForm = f} key="fileform" />
        <div className="form-group">
          <button onClick={this.onSubmit} className="btn btn-primary" disabled={saving}>
          {saving && <div className="loading"></div>}
          Save
          </button>
        </div>
      </div>
    )
  }
}

global.GeoForm = {
  show: (el, props) => {
    var geoform = React.createElement(GeoForm, props);
    ReactDOM.render(geoform, document.getElementById(el));
  }
};
export default GeoForm;
