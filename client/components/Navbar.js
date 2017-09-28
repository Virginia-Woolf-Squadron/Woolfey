import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import {Link} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="navbar">
        <Navbar inverse collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <img src='/images/wolfHead.png' className='woolfVisionBig' />
            </Navbar.Brand>
            <Navbar.Brand>
              <a href="/">Woolfey</a>
            </Navbar.Brand>
            <Navbar.Toggle /> 
          </Navbar.Header>
          <Navbar.Collapse>

            {this.props.loggedIn ?
            
            <Nav pullRight>
              <LinkContainer to='/portfolio'>
                <NavItem eventKey={6} >Portfolios</NavItem>
              </LinkContainer>

              <LinkContainer exact to='/'>
                <NavItem onClick={this.props.handleLogOut}>Logout</NavItem>
              </LinkContainer>
            </Nav>

            :

            <Nav pullRight>
              <LinkContainer to='/login'>
                <NavItem eventKey={8} >Login</NavItem>
              </LinkContainer>
             
            </Nav>

            
            }
    
            <Nav pullRight>
              <LinkContainer to='/leaderboard'>
              <NavItem eventKey={3} >Leaderboard</NavItem>
              </LinkContainer>
            </Nav>

            <Nav pullRight>
              <NavDropdown eventKey={3} title="Currencies" id="basic-nav-dropdown">
                <MenuItem eventKey={3.1} href="/currency/btc">Bitcoin &nbsp;&nbsp;btc &nbsp;&nbsp;<img src='/images/wolfHead.png' className='woolfVision' /> </MenuItem>
                <MenuItem eventKey={3.2} href="/currency/bch">Bitcoin Cash &nbsp;&nbsp;bch</MenuItem>
                <MenuItem eventKey={3.3} href="/currency/eth">Ethereum &nbsp;&nbsp;eth</MenuItem>
                <MenuItem eventKey={3.4} href="/currency/ltc">Litecoin &nbsp;&nbsp;ltc &nbsp;&nbsp;<img src='/images/wolfHead.png' className='woolfVision' /></MenuItem>
                <MenuItem eventKey={3.5} href="/currency/xrp">Ripple &nbsp;&nbsp;xrp</MenuItem>
                <MenuItem eventKey={3.6} href="/currency/xmr">Monero &nbsp;&nbsp;xmr</MenuItem>
              </NavDropdown>
            </Nav>

            {this.props.handleDelete && this.props.isOwner ?

          <Nav pullRight onClick ={this.props.handleDelete}>
            
            <NavItem eventKey={4} className='deleteButton'>Delete</NavItem>
            
          </Nav>
          :
          null}

          </Navbar.Collapse>
        </Navbar>
      </div>
    )
  }
}