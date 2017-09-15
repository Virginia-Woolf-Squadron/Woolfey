import React from 'react'
import {Link} from 'react-router-dom'
import {Modal} from 'react-bootstrap'
import axios from 'axios'

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showModal: false
    }
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  openModal(e) {
    this.setState({
      showModal: true
    })
  }

  closeModal(e) {
    this.setState({
      showModal: false
    })
  }

  render() {

    return (

      <div>

        

        <div className="bgimg-1 w3-display-container w3-opacity-min" id="home">
          <div className="w3-display-middle needNoWrap">
            <span className="w3-center w3-padding-large w3-black w3-xlarge w3-wide w3-animate-opacity">WOOLFEY</span>
          </div>
          
          {localStorage.getItem('token') ? 
            <Link to='/portfolio'>
              <div className='w3-display-middle needNoWrap'>
                <h3 id='landingBegin' className='w3-center w3-padding-large w3-wide w3-animate-opacity'>BEGIN</h3>
              </div>
            </Link>

            :

            <Link to='/login'>
              <div className='w3-display-middle needNoWrap'>
                <h3 id='landingBegin' className='w3-center w3-padding-large w3-wide w3-animate-opacity'>BEGIN</h3>
              </div>
            </Link>
          }
        </div>

        
        <div className="w3-content w3-container w3-padding-64" id="about">
          <h3 className="w3-center">CRYPTOCURRENCY TRADE SIMULATOR</h3>
          <p className="w3-center"><em>Practice trading cryptocurrencies utilizing WoolfVision</em></p>
          <p>
            Use our cryptocurrency trading simulator to practice your trades before you spend your actual money. 
            Our simulator uses real time data for all cryptocurrencies, allowing you to perform your trades the same as 
            you would normally. Build your portfolio, experience the leaps and falls of the cryptocurrency market, and practice trading
            before your money is truly on the line. Be the best trader on Woolfey and reach the top of our leaderboards.
            <br /> <br />
            You will also have access to WoolfVision. Using machine learning and sentiment analysis, we have developed a program that can predict the future prices of multiple 
            crypto currencies, including Bitcoin, Ethereum, and Litecoin. Utilizing data from a number of resources, our WoolfVision technology 
            is able to make predictions with up to 99% accuracy.
          </p>
          <div className="w3-row">
            <div className="w3-col m6 w3-center w3-padding-large">
              <img src="/images/chart.png" id='landingSmallChart' className="w3-round w3-image w3-opacity w3-hover-opacity-off" onClick={this.openModal} alt="Photo of Me" width="500" height="333" />
            </div>

            <Modal show={this.state.showModal} bsSize='large' onHide={this.closeModal} restoreFocus={true} >
              <Modal.Body>
                <img src='/images/chart.png' id='modalChart' />
              </Modal.Body>
            </Modal>

            
            <div className="w3-col m6 w3-hide-small w3-padding-large">
              <p>Get historical, real time, and predicted future data.
                <br />
                Build multiple portfolios and practice trading  with six different cryptocurrencies.
              </p>
            </div>
          </div>
        </div>

        <div className="bgimg-2 w3-display-container w3-opacity-min">
          <div className="w3-display-middle">
            <span className="w3-xxlarge w3-text-white w3-wide">MEET THE TEAM</span>
          </div>
        </div>

        <div className="w3-content w3-container w3-padding-64" id="portfolio">

          <div className='w3-row'>

            <div className='w3-col m4 w3-center'>
              <h3>JR Gray</h3>
              <img src='/images/jr.jpg' className='founderPics w3-image' />
              <br />
              <br />
              <p><em>Founder / Developer</em></p>
              <a href='#' style={{'textDecoration': 'underline'}}>jrgray@woolfey.com</a>
              <p><a href='http://github.com/jr-gray' style={{'textDecoration': 'underline'}}>Github</a></p>
              <p>
                JR is a software engineering whiz with a passion for creative design and technical innovation. Despite the 
                breakout success of his first project, Syrup, he decided to leave the dating industry and try his hand at 
                cryptocurrency. His rise to fame has made him a household name in the tech industry, and now he’s hoping to 
                strike gold a second time, with his new project, Woolfey. Outside of work, you’ll find him at the gym, 
                watching sports, or searching for the perfect breakfast burrito.
              </p>
            </div>

            <div className='w3-col m4 w3-center'>
              <h3>Zander Jardini</h3>
              <img src='/images/zander.jpg' className='founderPics w3-image ' />
              <br />
              <br />
              <p><em>Founder / Developer</em></p>
              <a href='#' style={{'textDecoration': 'underline'}}>zander@woolfey.com</a>
              <p><a href='http://github.com/ajardini17' style={{'textDecoration': 'underline'}}>Github</a></p>
              <p>
              Zander is known for both his drive to craft elegant, software solutions as well as noted devotion to the LA Clippers. 
              Where he's as comfortable making ravioli from scratch as on a rugby pitch. The only desire that can possibly match 
              growing as a software developer is the call to adventure of world travel. 
              </p>
            </div>

            <div className='w3-col m4 w3-center'>
              <h3>Eddie Keller</h3>
              <img src='/images/eddie.jpg' className='founderPics w3-image' />
              <br />
              <br />
              <p><em>Founder / Developer</em></p>
              <a href='#' style={{'textDecoration': 'underline'}}>eddiekeller@woolfey.com</a>
              <p><a href='http://github.com/116ekg' style={{'textDecoration': 'underline'}}>Github</a></p>
              <p>
                Eddie is a software engineer with a passion for technology. Before coming to Woolfey, Eddie earned a Master's 
                degree from Arizona State University and worked in the news industry. Now, he enjoys finding new tech to work 
                with, competitive gaming and eSports, and provides voice overs for commercials, animation, and games.
              </p>
            </div>

          </div>

          <br />
        </div>


      </div>

    )
  }
}