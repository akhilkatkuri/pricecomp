const cheerio = require('cheerio');
const express=require('express');
const cors=require('cors');
const bodyparser=require('body-parser');
const app=express();
const axios=require('axios');
app.use(cors());
app.use(bodyparser.json())
const PORT=8000;

let productName;
app.get('/favicon.ico',function(req,res){
    res.status(204).end();
})
app.post('/product',function(req,res)
{
    console.log(req.body);
    productName=req.body.text;
    
});
app.get('/product',function(req,res){
    res.json("welcome");
})
app.get('/',function(req,res){
    const url = 'https://www.flipkart.com/search?q=' + encodeURIComponent(productName);
    async function getproductsflip(){
        let flipproducts;
        try{
            const res1=await axios.get(url);
            const $=cheerio.load(res1.data);
            flipproducts=await Promise.all(
                $('div._1AtVbE').find('div[data-id]').map(async function () {
                    const logo="flipkart";
                    const produrl = $(this).find('a').attr('href');
                    const price = $(this).find('div._30jeq3').text();
                    const imgurl = $(this).find('img').attr('src');
                    const res2 = await axios.get("https://www.flipkart.com" + produrl);
                    const n$ = cheerio.load(res2.data);
                    const productname = n$('div._1AtVbE').find('span.B_NuCI').text();
                    return {
                      Url: "https://www.flipkart.com" + produrl,
                      Price: price,
                      Imgurl: imgurl,
                      Productname: productname,
                      Logo:logo
                    };
                  }).get()
                );
                return flipproducts;
        } catch(error){
            console.log(error);
            res.json("Error: ");
        }
        
    }
    async function getproductsamaz() {
        try {
          const options = {
            method: 'GET',
            url: 'https://amazon23.p.rapidapi.com/product-search',
            params: {
              query: productName,
              country: 'IN',
            },
            headers: {
              'content-type': 'application/octet-stream',
              'X-RapidAPI-Key': '9f8b1f0dcbmsh5cbf5d515b5de7fp16b670jsn6c749a13ab13',
              'X-RapidAPI-Host': 'amazon23.p.rapidapi.com',
            },
          };
          const res2 = await axios.request(options);
          const amazonProducts = res2.data.result.map((item) => {
            return {
              Url: item.url,
              Price: item.price.current_price,
              Imgurl: item.thumbnail,
              Productname: item.title,
              Logo:"amazon"
            };
          });
      
          return amazonProducts;
        } catch (error) {
          console.log(error);
        }
    }
    async function getproducts(){
        let products=[];
        const flipprom=await getproductsflip();
        const amzprom=await getproductsamaz();
        const [flipprod,amazprod]=await Promise.all([flipprom,amzprom]);
        let min=Math.min(flipprod.length,amazprod.length);
        for(let i=0;i<min;i++)
        {
            products.push(flipprod[i]);
            products.push(amazprod[i]);
        }
        if(flipprod.length===min)
        {
            for(let i=min;i<amazprod.length;i++)
            {
                products.push(amazprod[i]);
            }
        }
        else
        {
            for(let i=min;i<flipprod.length;i++)
            {
                products.push(flipprod[i]);
            }
        }
        console.log(products);
        res.json(products);
    }
    getproducts();
});
app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`);
});
