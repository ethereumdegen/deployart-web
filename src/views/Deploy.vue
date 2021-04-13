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
          <div class="text-lg font-bold mb-8"> Deploy an NFT  </div>
          
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
              <label   class="block text-md font-medium font-bold text-gray-800  ">Token Metadata IPFS Hash</label>

              <div class="flex flex-row">
              <div class="w-1/2  ">
                    <input type="text"   v-model="formInputs.artName"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="ipfs://qradw112d2...">
                </div>

               
              </div>
           
            </div>



                <div class="mb-4">
                <label   class="block text-md font-medium font-bold text-gray-800  ">Purchase Currency Token</label>
                

                <div class="flex flex-row">

                <GenericDropdown
                  v-bind:optionList="currencyTokensOptionsList" 
                  v-bind:onSelectCallback="onCurrencySelectCallback"
                />
                  <div class="mb-4 p-4 ml-8" v-if="formInputs.tokenContractAddress">
                    Balance: {{ getSelectedCurrencyBalanceFormatted() }}
                </div>
                </div>


            </div>

            

              
           <div class="mb-4 ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Purchase Currency Amount</label>

              <div class="flex flex-row">
              <div class="w-1/2 ">
                    <input type="number"   v-model="formInputs.tokenBidAmountFormatted"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="0.00">
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

           <div class="py-4" v-if=" connectedToWeb3 && !mintSubmitComplete">
             
 
 
 
                 <div class="  p-4">
                     <div @click="signForMint" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Launch </div>
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
 

import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import TabsBar from './components/TabsBar.vue';
import GenericTable from './components/GenericTable.vue';
import GenericDropdown from './components/GenericDropdown.vue';
 

import FrontendHelper from '../js/frontend-helper.js'

export default {
  name: 'Deploy',
  props: [],
  components: {Navbar, Footer, TabsBar, GenericTable, GenericDropdown,NotConnectedToWeb3},
  data() {
    return {
      web3Plug: new Web3Plug() , 
  
      formInputs:{},

       
      connectedToWeb3: false,
      currentBlockNumber: 0,
      mintSubmitComplete:false
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
     
  }, 
  methods: {
          
  }
}
</script>
