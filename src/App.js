import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Rank from './Components/Rank/Rank';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Particles from 'react-particles-js';
import './App.css';
import Clarifai from 'clarifai';


const app = new Clarifai.App({
  apiKey: "68e14098424643689fda0c6e853c688d"
});

const particlesOptions ={
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageURL: ''
    }
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }
  
  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input })
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
      .then(
      function (response) {
        console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    },
      function (err) {

      }
    );
  }
   
  render() {
    return (
      <div className="App">
        <Particles className = 'particles' 
          params={ particlesOptions }/>
        <Navigation />
        <Logo />
        <Rank />
        <ImageLinkForm 
          onInputChange = { this.onInputChange } 
          onButtonSubmit = { this.onButtonSubmit }/>
        <FaceRecognition imageURL = {this.state.imageURL}/>
      </div>
    );
  } 
}

export default App;
