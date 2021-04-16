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
          <div class="text-lg font-bold mb-8"> Define an NFT  </div>
          
          <div  class=" " v-if="!connectedToWeb3">
              <NotConnectedToWeb3 />
          </div>

          <div  class=" px-4" v-if=" connectedToWeb3">

             
            

          

             <div class="mb-4  ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Name of Work</label>

              <div class="flex flex-row">
              <div class="w-1/2  ">
                    <input type="text"   v-model="formInputs.artName"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="my first work">
                </div>

               
              </div>
           
            </div>

            <div class="mb-4  ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Token Metadata IPFS Hash <a href="https://docs.deploy.art/ipfs-uri" target="_blank">[help]</a></label>

              <div class="flex flex-row">
              <div class="w-1/2  ">
                    <input type="text"   v-model="formInputs.artURI"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="ipfs://qradw112d2...">
                </div>

               
              </div>
           
            </div>



            <div class="mb-4 ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Max Copies</label>

              <div class="flex flex-row">
              <div class="w-1/2 ">
                    <input type="number"   v-model="formInputs.maxCopies"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="0.00">
                </div> 
                 
              </div>
           
            </div>





                <div class="mb-4">
                <label   class="block text-md font-medium font-bold text-gray-800  "> Currency Token</label>
                

                <div class="flex flex-row">

                <GenericDropdown v-if="currencyTokensOptionsList"
                  v-bind:optionList="currencyTokensOptionsList" 
                  v-bind:onSelectCallback="onCurrencySelectCallback"
                />
                   
                </div>


            </div>

            

              
           <div class="mb-4 " :class=" { 'hidden':  currencyIsSelected()  } " >
              <label   class="block text-md font-medium font-bold text-gray-800  ">Price To Mint (currency token)</label>

              <div class="flex flex-row">
              <div class="w-1/2 ">
                    <input type="number"   v-model="formInputs.currencyAmountFormatted"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="0.00">
                </div> 
                 
              </div>
           
            </div>





              <div class="mb-4">
                <label   class="block text-md font-medium font-bold text-gray-800  ">Required NFT Held to Mint</label>
                
                <GenericDropdown
                  ref="nftOptionList"
                  v-bind:optionList="nftOptionsList" 
                  v-bind:onSelectCallback="onNFTSelectCallback"
                />
            </div>




          </div>

           <div class="py-4" v-if=" connectedToWeb3 && !submitComplete">
              
 
                 <div class="  p-4">
                     <div @click="signForMint" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Define NFT </div>
                </div>


          </div>


         <div class="py-4" v-if=" connectedToWeb3 && submitComplete">
              
              <div> NFT Definition Data </div>
                 <div class="  p-4  ">
                  <TextArea v-html="definedNFTJSON" class="text-black w-full border-2 border-black p-2" rows="9" disabled/> 
                </div>


                  <div class="  p-4">
                     <div @click="copyDefinition" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Copy Definition </div>
                
                       <div @click="resetForm" class="ml-4 select-none bg-red-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Reset Form </div>
            
                </div>


                <hr> 
                 <div class="  p-4">
                    <div class="m-2 p-2 bg-gray-200 text-blue-800 inline-block"> This NFT definition can be used, by anyone, to mint the NFT on-chain. It is digitally signed by you as the artist.  </div> 
                    <br> 
                     <router-link to="/mint" class="m-2 select-none no-underline text-white bg-green-500 p-2 inline-block rounded border-black border-2 cursor-pointer"> Mint the NFT </router-link >
                </div>

 

          </div>



          
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

export default {
  name: 'Define',
  props: [],
  components: {Navbar, Footer, TabsBar, GenericTable, GenericDropdown,NotConnectedToWeb3},
  data() {
    return {
      web3Plug: new Web3Plug() , 
  
      formInputs:{currencyAmountFormatted:0,artURI:"ipfs://",maxCopies:1},

      currencyTokensOptionsList: [],
      nftOptionsList: [],


       
      connectedToWeb3: false,
      currentBlockNumber: 0,
      submitComplete:false,

      definedNFTJSON:""
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
    
  

  



  },
  mounted: function () {

    let chainId = this.web3Plug.getActiveNetId()
    let contractData = this.web3Plug.getContractDataForNetworkID(chainId)
  
      if(!chainId)chainId =1;

    let currencyTypesArray = this.web3Plug.getCurrencyTokensForNetworkID(chainId)
   
      this.currencyTokensOptionsList = [{"name":"none","label":"None" } ].concat( currencyTypesArray  )
    
    
    let nftTypesArray =   this.web3Plug.getNFTTypesForNetworkID(chainId)  
   

     this.nftOptionsList = [{"name":"any","label":"Any" } ].concat( nftTypesArray  )


  }, 
  methods: {


    onCurrencySelectCallback(selectedItem){
      let assetName = selectedItem.name 

      let chainId = this.web3Plug.getActiveNetId()
      let contractData = this.web3Plug.getContractDataForNetworkID(chainId)[assetName]
       

      if(contractData){
         
        this.formInputs.selectedCurrency = contractData 
      }else{
        this.formInputs.selectedCurrency = {"name":"none","label":"None","address": "0x0000000000000000000000000000000000000000", "decimals": 8 } 

      }


    this.$forceUpdate();  
    },
    onNFTSelectCallback( selectedItem ){
       let assetName = selectedItem.name 

      let chainId = this.web3Plug.getActiveNetId()
      let contractData = this.web3Plug.getContractDataForNetworkID(chainId)[assetName]

      if(contractData){
        this.formInputs.selectedNFT = contractData.address
      }else{
        this.formInputs.selectedNFT = "0x0000000000000000000000000000000000000000"
      }
    this.$forceUpdate();  
    },
    async signForMint(){
      console.log('sign for mint')


      let artistAddress = this.web3Plug.getActiveAccountAddress()

      let chainId = this.web3Plug.getActiveNetId()
      let contractAddress = this.web3Plug.getContractDataForNetworkID(chainId)['digitalNFT'].address

      let artURI = this.formInputs.artURI

    
       
        let currencyDecimals  = this.formInputs.selectedCurrency.decimals 
        let currencyAmountRaw = MathHelper.formattedAmountToRaw(this.formInputs.currencyAmountFormatted,currencyDecimals) 
 
     

       let dataValues = {
        artist:artistAddress,
        keypassToken: this.formInputs.selectedNFT ,
        uri: artURI,
        maxCopies: parseInt( this.formInputs.maxCopies ),
        expirationBlock: 0,
        currencyToken:  this.formInputs.selectedCurrency.address ,
        currencyAmount: currencyAmountRaw
        
      }  

      console.log('dataValues', dataValues)


      let signResults = await EIP712Utils.performOffchainSignForBidPacket( chainId, contractAddress, eip712config, dataValues , artistAddress, this.web3Plug.getWeb3Instance() )
       let signature = signResults.signature

      let nftContract = this.web3Plug.getCustomContract( DigitalNFTABI, contractAddress );

      let minterAddress = this.web3Plug.getActiveAccountAddress()

      let args = Object.values( dataValues )
      args.push(signature)

      console.log('minterAddress',minterAddress)

      this.submitComplete=true


      dataValues.signature = signature 


      this.definedNFTJSON = JSON.stringify( dataValues  )

     console.log('definedNFTJSON',this.definedNFTJSON)


      //send this data up to the server in a broadcast !!! 

      // then it will show up in the gallery of possible NFTs to mint !! 

      //allow people to register their eth address to a name by offchain sign 

    //  let response = await nftContract.methods.mint(minterAddress, ...args ).send({from:  minterAddress })
    },

    currencyIsSelected(){
      let result =  this.formInputs.selectedCurrency && this.formInputs.selectedCurrency.name != 'none'

      console.log('currencyIsSelected',result)
    },

    copyDefinition(){

      this.$clipboard(this.definedNFTJSON);
      alert("Copied to clipboard");

    },

    resetForm(){
        this.submitComplete=false
    }
          
  }
}
</script>
