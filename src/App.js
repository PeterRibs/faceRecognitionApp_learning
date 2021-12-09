import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Rank from './Components/Rank/Rank';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Particles from 'react-particles-js';
import './App.css';
import Clarifai from 'clarifai';


const app = new Clarifai.App({
  apiKey: "Your key"
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
      imageURL: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        email: '',
        id:'',
        name:'',
        entries:0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState( {user: {
      id: data.id,
      name:data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})

  }

  CalculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height= Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value })
  }
  
  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input })
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
      .then(response => {
        if(response){
          fetch('http://localhost:3000/image', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayFaceBox(this.CalculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({ isSignedIn: false })
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }
   
  render() {
    const { isSignedIn, imageURL, box, route } = this.state;
    return (
      <div className="App">
        <Particles className = 'particles' 
          params={particlesOptions} />
        <Navigation  isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange} />
        {route === 'home' 
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                onInputChange = { this.onInputChange } 
                onButtonSubmit = { this.onButtonSubmit }/>
              <FaceRecognition box={box} imageURL = {imageURL}/>
            </div>
          : (
            (route === 'signin' || route === 'signout')
            ?<Signin loadUser = {this.loadUser} onRouteChange = { this.onRouteChange }/>
            :<Register loadUser={this.loadUser} onRouteChange = { this.onRouteChange }/>
          )
        }
      </div>
    ); 
  }
}

export default App;
