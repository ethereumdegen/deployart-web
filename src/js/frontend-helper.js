

  
 
import axios from "axios";

const env = process.env.NODE_ENV

const clientConfig = require('../config/clientConfig.json')[env]
 
const contractDataLookup = require('../config/generated/contractlookup.json')

export default class FrontendHelper {

    constructor( ){
      

    }

    static async requestAccessChallenge(publicAddress){
      let api_root = FrontendHelper.getRouteTo('api')


      let uri = api_root.concat( '/generate_access_challenge/' )
      let inputData = {publicAddress: publicAddress} 


      return new Promise(   (resolve, reject) => {

        axios.post(uri, inputData )
        .then((res) => {
           
             console.log(res.data)
             let results = res.data
            
       
              resolve(results)
  
         }) .catch((error) => {
             console.error(error)
             reject(error)
         })
  
     }); 

     
    }

    static async requestAccessToken(publicAddress , signature){
      let api_root = FrontendHelper.getRouteTo('api')


      let uri = api_root.concat('/generate_access_token')
      let inputData = {publicAddress:publicAddress,signature:signature} 


      return new Promise(   (resolve, reject) => {

        axios.post(uri, inputData )
        .then((res) => {
           
             console.log(res.data)
             let results = res.data
            
       
              resolve(results)
  
         }) .catch((error) => {
             console.error(error)
             reject(error)
         })
  
     }); 

     
    }


    static getRouteTo(dest){
 
        return clientConfig.external_routes[dest]
      

    }


    static ZeroAddress(){
        return "0x0000000000000000000000000000000000000000"
    }

    static findContractDataFromAddress(contractAddress, chainId){

        contractAddress = contractAddress.toLowerCase()

        if(contractAddress == FrontendHelper.ZeroAddress()){
            return {"name": "None", "address": contractAddress , 'isNull': true}
        }

        let networkName = 'mainnet'

        if(chainId == 5) networkName = 'goerli';

        return contractDataLookup[networkName][contractAddress]['0']


    }


    static getLinkToVirtualNFT(params){

        return '/mint'.concat(FrontendHelper.getVirtualNFTUrlParams(params))
      }

    static getVirtualNFTUrlParams(params){

        if(!params.referralAddress){params.referralAddress = FrontendHelper.ZeroAddress()}
 
        return `?artist=${params.artist}&referralAddress=${params.referralAddress}&keypassToken=${params.keypassToken}&uri=${params.uri}&maxCopies=${params.maxCopies}&expirationBlock=${params.expirationBlock}&currencyToken=${params.currencyToken}&currencyAmount=${params.currencyAmount}&signature=${params.signature}`

    }


}