<template>

<div>

 <div class="section bg-gray-200  border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug" 
       />
     </div>


   </div>



   <div class="section    bg-gray-800  py-16">
   

     <div class="w-container ">
         
     <div >
        <div class="mt-8   text-xl text-white font-bold text-center"> Art Project  </div>
         <div class="  mb-16 text-md text-white   text-center">  Punk 1164 Grafitti </div>


     </div>


       <div v-for="image in imageArray" class="mb-8" > 

         <img v-bind:src="image.src" />
          <div class="text-white text-center p-4"> Owned by {{image.ownerAddress}}</div>
       </div>
     </div>


     <div class="text-center"> <a class="text-yellow-400" href="https://infernaltoast.medium.com/infernaltoasts-nft-scavenger-hunt-c1038a176e87"> Read more about obtaining '1164 grafitti' in the Scavenger Hunt </a> </div>
      


   </div>

  

   

 
  <Footer/>

</div>
</template>


<script>



import NotConnectedToWeb3 from './components/NotConnectedToWeb3.vue'

import Web3Plug from '../js/web3-plug.js' 
import AccessPlug from '../js/access-plug.js' 

 

import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
 
import FrontendHelper from '../js/frontend-helper.js'

import StarflaskAPIHelper from '../js/starflask-api-helper.js'

export default {
  name: 'Grafitti',
  props: [],
  components: {Navbar, Footer,   NotConnectedToWeb3},
  data() {
    return {
      web3Plug: new Web3Plug() ,
     
      imageArray: [],
       
      connectedToWeb3: false 
   
    }
  },

  created(){

 
    this.web3Plug.getPlugEventEmitter().on('stateChanged', async function(connectionState) {
        console.log('stateChanged',connectionState);
         
        this.activeAccountAddress = connectionState.activeAccountAddress
        this.activeNetworkId = connectionState.activeNetworkId
        this.connectedToWeb3 = this.web3Plug.connectedToWeb3()
 
         
         
      }.bind(this));
   this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
        console.error('error',errormessage);
         
        this.web3error = errormessage
       
      }.bind(this));

      this.web3Plug.reconnectWeb()

      this.fetchGraffitiData()  
      

  },
  mounted: function () {
    
      
   
  }, 
  methods: {

    async fetchGraffitiData(){

      const tokenIdOwners = [] 

      const grafittiData = {
        '0': {src: '/images/grafitti/Grafitti_0.jpg' , tokenId: 0 },
        '1': {src: '/images/grafitti/Grafitti_1.jpg' , tokenId: 2 },
        '2': {src: '/images/grafitti/Grafitti_2.jpg' , tokenId: undefined },
        '3': {src: '/images/grafitti/Grafitti_3.jpg' , tokenId: 3 },
        '4': {src: '/images/grafitti/Grafitti_4.jpg' , tokenId: undefined } 
      }

      let apiURI = 'https://api.starflask.com/api/v1/testapikey'
      let inputData = {requestType: 'ERC721_balance_by_contract', input: { contractAddress:'0x4e3c5d37ca4d92b54248c411b496a0c959bcfe57' } } 
      let results = await StarflaskAPIHelper.resolveStarflaskQuery(apiURI ,  inputData   )
      console.log('results',results)


      for(let artOwner of results.output){
        for(let tokenIdOwned of artOwner.tokenIds){
          let id = parseInt(  tokenIdOwned  )
          tokenIdOwners[id] = artOwner.accountAddress;
        }

      }
 

      for(let [index, data] of Object.entries(grafittiData)){
        let newImageData = Object.assign({}, data ) 
 
        if(typeof newImageData.tokenId != 'undefined' && tokenIdOwners[newImageData.tokenId] ){
       
          newImageData.ownerAddress = tokenIdOwners[newImageData.tokenId] 
            
        }

        if(!newImageData.ownerAddress){
           newImageData.ownerAddress = '?'
        } 

        this.imageArray.push(newImageData)
      }

    


    }
          
  }
}
</script>
