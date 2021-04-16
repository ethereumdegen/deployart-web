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
          <div class="text-lg font-bold mb-4"> Mint an NFT  </div>
           <div class="  mb-8"> Use NFT definition data that was cryptographically signed by the artist to deploy the work on-chain.  </div>
         
          <div  class=" " v-if="!connectedToWeb3">
              <NotConnectedToWeb3 />
          </div>

          <div  class=" px-4" v-if=" connectedToWeb3">

              
          
          <div  class=" px-4" v-if="!hasDefinition">

             <div class="mb-4  ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Paste NFT Definition Data </label>

              <div class="flex flex-row w-full" >
                <textarea v-model="pastedNFTDefinition" class="w-full p-2 border-2 border-black text-black" rows="8" />
              </div>
           
            </div>


                <div class="  p-4">
                     <div @click="readPastedDefinition" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer">Continue </div>
                </div>
          </div>

             
        <div  class=" px-4" v-if=" hasDefinition">

            <div class="border-2 border-black p-4 rounded ">
                <div class="mb-4" >
              <label   class="block text-md font-medium font-bold text-gray-800  ">NFT Definition</label>
                    
                  <div> Artist:  {{nftDefinition.artist}}</div>
                  
                  <div> Art URI: <a v-bind:href="getCloudflareIPFSURL(nftDefinition.uri)" target="_blank">  {{nftDefinition.uri}}  </a> </div>

                    <div> Max Copies:  {{nftDefinition.maxCopies}}</div>
                  

                </div>



              <div class="mb-4" v-if="!this.currencyTokenContractData.isNull" >
                    <label   class="block text-md font-medium font-bold text-gray-800  "> Cost to Mint NFT (paid to artist) </label>
                    

                    <div class="flex flex-col">

                      

                    
                     

                        <div> Cost:  {{this.currencyTokenContractData.currencyAmountFormatted}} {{this.currencyTokenContractData.name}} </div>
                         <div class="hidden"> Currency Address:  {{this.currencyTokenContractData.address}} </div>

                      <div class="  p-4" v-if="approveButtonIsVisible()">
                            <div @click="approveCurrencyToken" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Approve </div>
                        </div>


                    </div>


                </div>

                

              <div class="mb-4" v-if="!this.requiredNFTData.isNull">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Required NFT Held to Mint</label>
                    
                  <div> NFT:  {{this.requiredNFTData.name}}</div>
                  <div> Address:  {{this.requiredNFTData.address}} </div>

                </div>


              <div class="py-4" v-if="!mintSubmitComplete">
                  
    
                    <div class="  p-4">
                        <div @click="mintToken" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Mint NFT </div>
                    </div>


              </div>


            <div class="py-4" v-if=" mintSubmitComplete">
                  
                <div> The art has been deployed! Enjoy. </div>

                

              </div>



          </div>

          <div class="  p-4">
                  <div @click="resetForm" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Reset </div>
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
 
import EIP712Utils from '../js/EIP712/EIP712Utils.js'

const eip712config = require('../js/EIP712/eip712-config.json')

const DigitalNFTABI = require('../contracts/DigitalNFT.json')

import FrontendHelper from '../js/frontend-helper.js'


var balanceTimer; 

export default {
  name: 'Deploy',
  props: [],
  components: {Navbar, Footer, TabsBar, GenericTable, GenericDropdown,NotConnectedToWeb3},
  data() {
    return {
      web3Plug: new Web3Plug() , 
  
      formInputs:{ },

      hasDefinition: false, 
      pastedNFTDefinition: "",

      nftDefinition: null,
      parsedNFTDefinition: null,
       
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
        this.currentBlockNumber = await this.web3Plug.getBlockNumber()

         
         
      }.bind(this));
   this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
        console.error('error',errormessage);
         
        this.web3error = errormessage
       
      }.bind(this));

      this.web3Plug.reconnectWeb()

      
      balanceTimer = setInterval(this.updateBalances, 8000);

  },
  mounted: function () {

    let chainId = this.web3Plug.getActiveNetId()
    let contractData = this.web3Plug.getContractDataForNetworkID(chainId)
 

    let currencyTypesArray = this.web3Plug.getCurrencyTokensForNetworkID(chainId)
   
      this.currencyTokensOptionsList = [{"name":"none","label":"None" } ].concat( currencyTypesArray  )
    
    
    let nftTypesArray =   this.web3Plug.getNFTTypesForNetworkID(chainId)  
   

     this.nftOptionsList = [{"name":"any","label":"Any" } ].concat( nftTypesArray  )


  }, 

  beforeDestroy(){
      clearInterval(balanceTimer)

  },
  methods: {

    async readPastedDefinition(){
      console.log('read ',  this.pastedNFTDefinition)

      if(this.pastedNFTDefinition){
        this.nftDefinition =  JSON.parse(this.pastedNFTDefinition)  
        this.hasDefinition = true; 

      
      }

      let parsedDefinition = this.nftDefinition

      let chainId = this.web3Plug.getActiveNetId()

      this.currencyTokenContractData = FrontendHelper.findContractDataFromAddress(parsedDefinition.currencyToken,chainId)

      if(!this.currencyTokenContractData.isNull){
        this.currencyTokenContractData.currencyAmountFormatted = MathHelper.rawAmountToFormatted(  parsedDefinition.currencyAmount ,this.currencyTokenContractData.decimals  )
      }

      this.requiredNFTData = FrontendHelper.findContractDataFromAddress(parsedDefinition.keypassToken,chainId)

        this.updateBalances()

    },


    async updateBalances(){ 
      console.log("update balances")

      if(this.nftDefinition){


       let minterAddress = this.web3Plug.getActiveAccountAddress()

        let chainId = this.web3Plug.getActiveNetId()

        let nftContractAddress  =  this.web3Plug.getContractDataForNetworkID(chainId)['digitalNFT'].address
        


       let tokenAddress = this.nftDefinition.currencyToken
      //  let amount = parseInt( parsedDefinition.currencyAmount ) 

       let tokenContract = this.web3Plug.getTokenContract( tokenAddress );

       let spender = nftContractAddress

       if( !this.currencyTokenContractData || this.currencyTokenContractData.isNull){
         return
       }

       let allowance = await tokenContract.methods.allowance(minterAddress,spender ).call({from:minterAddress})

       this.currencyTokenAllowance = parseInt(allowance)
        console.log('this.currencyTokenAllowance',this.currencyTokenAllowance ,  this.nftDefinition.currencyAmount )

      }

    },

    approveButtonIsVisible(){
      return (this.currencyTokenAllowance == 0)
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
      if(hash.includes("://")){
        hash = hash.split('://')[1]
      }

      return `https://cloudflare-ipfs.com/ipfs/${hash}`

    }
          
  }
}
</script>
