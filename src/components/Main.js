//pic size 687*687
import React from 'react'
import {Link} from 'react-router-dom'


class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)



  }


  componentDidMount(){

    

  }

  componentDidUpdate(prevProps){



  }





  render() {

    console.log(this.state)

    return (
      <div className='main'>

        <div className='head'>
        hiya
        </div>




      </div>



    )
  }
}
export default Main
