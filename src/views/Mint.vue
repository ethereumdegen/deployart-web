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
         
       

          <div  class=" px-4"  >

              
          
          <div  class=" px-4" v-if="!hasDefinition">

             <div class="mb-4  ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Paste NFT Definition Data </label>

              <div class="flex flex-row w-full" >
                <textarea v-model="pastedNFTDefinition" class="w-full p-2 border-2 border-black text-black" rows="8" />
              </div>
           
            </div>


                <div class="  p-4">
                     <div @click="readPastedDefinition" class="select-none bg-white-300 p-2 inline-block rounded border-black border-2 cursor-pointer">Continue </div>
                </div>



          </div>

             
        <div  class=" px-4" v-if=" hasDefinition">

            <div class="border-2 border-black p-4 rounded ">



               <div class="w-full mb-4 lg:flex lg:flex-row">  

                    <div class="lg:w-2/3" > 
                
                        <label   class="block text-md font-medium font-bold text-gray-800  ">NFT Definition</label>
                            
                          
                           <div v-if="assetManifestData && assetManifestData.name" class=" text-xs"> Name:  {{assetManifestData.name}}</div>
                            
                          <div class=" text-xs"> Artist:  {{nftDefinition.artist}}</div>

                          
                          <div  class=" text-xs" > Token URI: <a v-bind:href="getCloudflareIPFSURL(nftDefinition.uri)" target="_blank">  {{nftDefinition.uri}}  </a> </div>

                            <div  class=" text-xs"> Max Copies:  {{nftDefinition.maxCopies}}</div> 

                            <div v-if="assetManifestData && assetManifestData.description" class=" text-xs"> Description:  {{assetManifestData.description}}</div>
                         

                    </div>

                       <div class="lg:w-1/3 text-center" > 
                        <div class="m-2 p-2 border-black border-2 w-1/2 lg:w-full" style="margin: auto;">
                         <img v-if="!ipfsDataErrored"  v-bind:src="getAssetImageSource()" class=" w-full"  />
                         <div v-if="ipfsDataErrored" class=" p-4"  > 
                           
                           <div class="bg-red-500 text-white p-2" > IPFS DATA ERROR </div> 

                           <a href="https://docs.deploy.art/ipfs-uri" class=" "> [help] </a> 
                           
                          </div>
                        </div>
                    </div>
              </div>


              <div class="mb-4" v-if="currencyTokenContractData !=null && !currencyTokenContractData.isNull && connectedToWeb3" >
                    <label   class="block text-md font-medium font-bold text-gray-800  "> Cost to Mint NFT (paid to artist) </label>
                    

                    <div class="flex flex-col">

                      

                    
                     

                        <div class="mt-4 text-sm "> Cost:  {{currencyTokenContractData.currencyAmountFormatted}} {{this.currencyTokenContractData.name}} </div>
                         <div class="hidden text-sm "> Currency Address:  {{this.currencyTokenContractData.address}} </div>

                      <div class="  p-4" v-if="approveButtonIsVisible()">
                            <div @click="approveCurrencyToken" class="select-none bg-teal-300 p-2 inline-block rounded border-black border-2 cursor-pointer"> Approve </div>
                        </div>


                    </div>


                </div>

                

              <div class="mb-4" v-if="requiredNFTData!=null && !requiredNFTData.isNull && connectedToWeb3">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Required NFT Held to Mint</label>
                    
                  <div> NFT:  {{this.requiredNFTData.name}}</div>
                  <div> Address:  {{this.requiredNFTData.address}} </div>

                </div>


              <div class="py-4" v-if="!mintSubmitComplete && connectedToWeb3">

                  <div class="  p-4">
                     <div @click="mintToken" class="select-none font-bold  p-2 inline-block rounded border-gray-600 border-2 cursor-pointer rainbow-hover px-8"> Mint </div>
                </div>

     


              </div>


            <div class="py-4" v-if=" mintSubmitComplete">
                  
                <div> The art has been deployed! Enjoy. </div>

                <div>  <a v-bind:href="getActiveUserEtherscanURL()" target="_blank" > View my Ethereum Account. </a>  </div>

              </div>



          </div>


          <div  class=" mt-8 " v-if="!connectedToWeb3">
              <NotConnectedToWeb3 />
          </div>

          <div class=" flex flex-row p-4" v-if="connectedToWeb3">
                  <div @click="resetForm" class="select-none bg-red-300 p-2 inline-block rounded   border-black border-2 cursor-pointer"> Reset </div>
            
                    <div class="flex-grow"> </div> 

                          <div  v-if="connectedToWeb3"  @click="copyReferralLink" class="select-none bg-purple-300 hover:bg-purple-400 p-2 inline-block rounded border-black border-2 cursor-pointer"> Copy Referral Link </div>
               
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
 
import IPFSDataHelper from '../js/ipfs-data-helper.js'

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

      assetManifestData: null,
       
      connectedToWeb3: false,
      ipfsDataErrored: false,

      mintSubmitComplete:false,
 
    }
  },

  async created(){

 
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

        await this.readDefinitionFromURL() 

  },
  mounted: function () {

    let chainId = this.web3Plug.getActiveNetId()
    let contractData = this.web3Plug.getContractDataForNetworkID(chainId)
 

  

    
  }, 

  beforeDestroy(){
      clearInterval(balanceTimer)

  },
  methods: {


      //http://localhost:8080/virtual?artist=012321
    async readDefinitionFromURL(){
      

          var url_string = window.location.href
          var url = new URL(url_string);
          var signature = url.searchParams.get("signature");

          if(!signature) return ;

          var definition =  {
              artist: url.searchParams.get("artist"),
              referralAddress:  url.searchParams.get("referralAddress"),
              keypassToken: url.searchParams.get("keypassToken"),
              uri: url.searchParams.get("uri"),
              maxCopies: url.searchParams.get("maxCopies"),
              expirationBlock:  url.searchParams.get("expirationBlock"),
              currencyToken:  url.searchParams.get("currencyToken"),
              currencyAmount:  url.searchParams.get("currencyAmount"),
              signature:  url.searchParams.get("signature")
            }  


          if(!definition.referralAddress){
            definition.referralAddress = FrontendHelper.ZeroAddress()
          }


       
         this.pastedNFTDefinition = JSON.stringify(definition)

         console.log('this.nftDefinition',this.nftDefinition);

         this.readPastedDefinition()

    },



    async readPastedDefinition(){
      console.log('read ',  this.pastedNFTDefinition)

      if(this.pastedNFTDefinition){
        this.nftDefinition =  JSON.parse(this.pastedNFTDefinition)  
        this.hasDefinition = true;       
      }

      let parsedDefinition = this.nftDefinition

      let chainId = this.web3Plug.getActiveNetId()


      if(!parsedDefinition.currencyToken){
        parsedDefinition.currencyToken = FrontendHelper.ZeroAddress()
        console.log('WARN: null currency address')
      }

      this.currencyTokenContractData = FrontendHelper.findContractDataFromAddress(parsedDefinition.currencyToken,chainId)

      if(this.currencyTokenContractData && !this.currencyTokenContractData.isNull){
            let formattedAmount = MathHelper.rawAmountToFormatted(  parsedDefinition.currencyAmount ,this.currencyTokenContractData.decimals  )

            formattedAmount = parseFloat(formattedAmount).toString()

           this.currencyTokenContractData.currencyAmountFormatted = formattedAmount; 
  
     }

      this.requiredNFTData = FrontendHelper.findContractDataFromAddress(parsedDefinition.keypassToken,chainId)

        this.updateBalances()


         this.updateMintableTokenData()


      

       let manifestFileHash = this.getIPFSHashFromString( parsedDefinition.uri )

        IPFSDataHelper.resolveGetRequest(`https://cloudflare-ipfs.com/ipfs/${manifestFileHash}`).then((manifestFileJSON)=>{

             let imageFileHash = this.getIPFSHashFromString( manifestFileJSON.image ) 

                 this.assetManifestData =manifestFileJSON

               this.assetImageSource = `https://cloudflare-ipfs.com/ipfs/${imageFileHash}`

               this.$forceUpdate(); 

        }  ).catch(error =>{
            this.ipfsDataErrored = true 

        } )

            

        //this.assetImageSource = `https://cloudflare-ipfs.com/ipfs/${imageFileHash}`
      


          
          console.log('this.assetImageSource',this.assetImageSource)

            this.$forceUpdate(); 

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
     
     
        this.$forceUpdate(); 
      }

    },


    async updateMintableTokenData(){

        let minterAddress = this.web3Plug.getActiveAccountAddress()

        let chainId = this.web3Plug.getActiveNetId()

        let nftContractAddress  =  this.web3Plug.getContractDataForNetworkID(chainId)['digitalNFT'].address
        
        let nftContract = this.web3Plug.getCustomContract( DigitalNFTABI, nftContractAddress );

        return 

        let projectId = 0 // need to take the hash of the contents data to find project id 

        let mintedCopies = await nftContract.methods.projectIdToMintedCopies(  projectId ).call()


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


       
        if(!parsedDefinition.referralAddress){
          parsedDefinition.referralAddress = FrontendHelper.ZeroAddress()
        }


       let dataValues = {
        artist: parsedDefinition.artist,
        referralAddress: parsedDefinition.referralAddress, 
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
 
      console.log('args',args)
      console.log('minterAddress',minterAddress)


      nftContract.methods.mint( ...args ).send({from:  minterAddress }).then((value) => {
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


    copyReferralLink(){

 
      let referralAddress = this.web3Plug.getActiveAccountAddress()  
      let definition = Object.assign({},    this.nftDefinition , {referralAddress: referralAddress}   )


       console.log('definition', definition)

      let refLink = FrontendHelper.getLinkToVirtualNFT(  definition )

      let windowLocation = (new URL(window.location.href));

      var urlroot = windowLocation.protocol +'//'+  windowLocation.hostname 

      if( windowLocation.port ){
        urlroot += ':' +   windowLocation.port
      }

      console.log('reflink', urlroot, refLink)

      this.$clipboard( urlroot.concat(refLink) );
      alert("Copied to clipboard");

    },


    getActiveUserEtherscanURL(){

        let minterAddress = this.web3Plug.getActiveAccountAddress()
         

      return this.web3Plug.getExplorerLinkForAddress(minterAddress) 

    },

    getIPFSHashFromString(hash){
      if(hash.includes("://")){
        hash = hash.split('://')[1]
      }

      return  hash

    },
    getCloudflareIPFSURL(hash){
      hash = this.getIPFSHashFromString(hash)

      return `https://cloudflare-ipfs.com/ipfs/${hash}`

    },

      getAssetImageSource(){
        return this.assetImageSource

    }
          
  }
}
</script>
