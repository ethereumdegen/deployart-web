<template>

<div>

   <div class="section bg-gray-200  border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug" 
       />
     </div>


   </div>

  

   <div class="section  bg-white border-b-2 border-black">
     <div class="py-16 w-container">
        
       <div class=" ">
          <div class="text-lg font-bold mb-4">  </div>
           
       

          <div  class=" px-4"  >
 
             
        <div  class=" px-4" v-if="nftDefinition" >

            <div class="border-2 border-black p-4 rounded ">
                <div class="mb-4" >
              <label   class="block text-md font-medium font-bold text-gray-800  ">Virtual NFT Definition</label>
                    
                  <div> Artist:  {{nftDefinition.artist}}</div>
                  
                  <div> Art URI: <a v-bind:href="getCloudflareIPFSURL(nftDefinition.uri)" target="_blank">  {{nftDefinition.uri}}  </a> </div>

                  <div> Max Copies:  {{nftDefinition.maxCopies}}</div>
                  

                </div>

 



          </div>
 


       </div>  <!-- has definition --> 
 





          </div><!-- connected --> 

        

      



          
       </div>
     </div>
   </div>


    


    
  <Footer/>

</div>
</template>


<script>



import NotConnectedToWeb3 from './components/NotConnectedToWeb3.vue'

import Web3Plug from '../js/web3-plug.js'  
 import MathHelper from '../js/math-helper.js'  
 

import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import TabsBar from './components/TabsBar.vue';
import GenericTable from './components/GenericTable.vue';
import GenericDropdown from './components/GenericDropdown.vue';
  

const DigitalNFTABI = require('../contracts/DigitalNFT.json')

import FrontendHelper from '../js/frontend-helper.js'

 

export default {
  name: 'Deploy',
  props: [],
  components: {Navbar, Footer, TabsBar, GenericTable, GenericDropdown,NotConnectedToWeb3},
  data() {
    return {
      web3Plug: new Web3Plug() , 
  
      formInputs:{ },

      

      nftDefinition: null, 
       
      connectedToWeb3: false,
     

      mintSubmitComplete:false,
 
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

         this.readDefinitionFromURL()

  },
  mounted: function () {

   
 
  }, 

  beforeDestroy(){
     

  },
  methods: {

      //http://localhost:8080/virtual?artist=012321
    async readDefinitionFromURL(){
      console.log('read ')

          var url_string = window.location.href
          var url = new URL(url_string);
          var artist = url.searchParams.get("artist");


          var definition =  {
              artist: url.searchParams.get("artist"),
              keypassToken: url.searchParams.get("keypassToken"),
              uri: url.searchParams.get("uri"),
              maxCopies: url.searchParams.get("maxCopies"),
              expirationBlock:  url.searchParams.get("expirationBlock"),
              currencyToken:  url.searchParams.get("currencyToken"),
              currencyAmount:  url.searchParams.get("currencyAmount"),
              signature:  url.searchParams.get("signature")
            }  

          this.nftDefinition = definition

         console.log('this.nftDefinition',this.nftDefinition);

    },

 


    async mintToken(){
      console.log('sign for mint')


    
      let chainId = this.web3Plug.getActiveNetId()
      let contractAddress = this.web3Plug.getContractDataForNetworkID(chainId)['digitalNFT'].address

        let parsedDefinition = this.nftDefinition

        console.log('parsed Definition', parsedDefinition  )


       

       let dataValues = {
        artist: parsedDefinition.artist,
        keypassToken:parsedDefinition.keypassToken,
        uri: parsedDefinition.uri,
        maxCopies: parsedDefinition.maxCopies,
        expirationBlock: parsedDefinition.expirationBlock,
        currencyToken: parsedDefinition.currencyToken,
        currencyAmount: parsedDefinition.currencyAmount,
        signature: parsedDefinition.signature
      }  

      console.log('dataValues', dataValues)


    
      let nftContract = this.web3Plug.getCustomContract( DigitalNFTABI, contractAddress );

      let minterAddress = this.web3Plug.getActiveAccountAddress()

      let args = Object.values( dataValues )
 

      console.log('minterAddress',minterAddress)


      nftContract.methods.mint(minterAddress, ...args ).send({from:  minterAddress }).then((value) => {
            console.log('response',value)

           this.mintSubmitComplete=true

        })
        .catch((error) => {
          console.error("Rejected!", error);
        })

   
 
  

     
    },

     
     


    async approveCurrencyToken(){
       console.log('approve currency token ')

      let approveAmount = "1000000000000000000000000000"
  
      let minterAddress = this.web3Plug.getActiveAccountAddress()

      let chainId = this.web3Plug.getActiveNetId()

      let nftContractAddress  =  this.web3Plug.getContractDataForNetworkID(chainId)['digitalNFT'].address
       

       let parsedDefinition = this.nftDefinition

      let tokenAddress = parsedDefinition.currencyToken
     // let amount = parsedDefinition.currencyAmount

       let tokenContract = this.web3Plug.getTokenContract( tokenAddress );

       let spender = nftContractAddress

       let response = await tokenContract.methods.approve(spender,approveAmount).send({from:minterAddress})

    },

    resetForm(){

        this.hasDefinition = false
        this.mintSubmitComplete=false
    },

    getCloudflareIPFSURL(hash){
      if(!hash){return '?'}

      if(hash.includes("://")){
        hash = hash.split('://')[1]
      }

      return `https://cloudflare-ipfs.com/ipfs/${hash}`

    }
          
  }
}
</script>
