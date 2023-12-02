const cheerio = require('cheerio');
const puppeteer=require("puppeteer");
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
    async function getproductscroma()
    {
      try {
        const browser = await puppeteer.launch({
          headless: false,
          args: ["--no-sandbox"],
        });
    
        console.log("Browser launched");
        const page = await browser.newPage();
        console.log("Page opened");
        const encodedSearchTerm = encodeURIComponent(productName);
        const baseURL = 'https://www.croma.com/searchB?q=';
        const parameter = 'relevance';
        const fullURL = `${baseURL}${encodedSearchTerm}%3A${parameter}&text=${encodedSearchTerm}`;

        await page.goto(fullURL, { waitUntil: "domcontentloaded" });
        console.log("URL visited");
    
        await page.waitForSelector(".product-list");
        console.log("Selector found");
    
        const allProducts = await page.evaluate(() => {
          const tempProducts = document.querySelectorAll('.product-item');
          let titles=[];
          let urls=[];
          let prices=[];
          let imgurls=[];
          tempProducts.forEach(tempProduct=>{
              const temptitles=tempProduct.querySelectorAll('.product-info .product-title');
              temptitles.forEach(temptitle=>{
                titles.push(temptitle);
              })
              const tempurls=tempProduct.querySelectorAll('.product-info .product-title a');
              tempurls.forEach(tempurl=>{
                urls.push('https://www.croma.com'+tempurl.getAttribute('href'));
              })
              const tempprices=tempProduct.querySelectorAll('.product-info .new-price .amount');
              tempprices.forEach(tempprice=>{
                prices.push(tempprice);
              })
              const tempimgurls=tempProduct.querySelectorAll('.plp-card-thumbnail');
              tempimgurls.forEach(tempimgurl=>{
                const tempimgs=tempimgurl.querySelectorAll('img');
                tempimgs.forEach(img=>{
                  imgurls.push(img.getAttribute('data-src'));
                })
              })
          })
          prices=Array.from(prices).map(product => product.textContent);
          titles=Array.from(titles).map(product => product.textContent);
          res=[];
          let n=prices.length;
          for(let i=0;i<n;i++)
          {
            res.push({
              Url:urls[i],
              Price:prices[i],
              Imgurl:imgurls[i],
              Productname:titles[i],
              Logo:"croma",
    
            })
          }
          return res;
        });
        console.log(allProducts.length)
        await browser.close();
        console.log("Browser closed");
        return allProducts;
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
    async function getproducts(){
        let products=[];
        // let amzprom=[];
        const flipprom=await getproductsflip();
       const amzprom=await getproductsamaz();
        const cromaprod=await getproductscroma();
        console.log(cromaprod);
        console.log(amzprom);
        const [flipprod,amazprod]=await Promise.all([flipprom,amzprom]);
        if(flipprod && amazprod){
            let min=Math.min(flipprod.length,cromaprod.length);
           
            for(let i=0;i<min;i++)
            {
                products.push(flipprod[i]);
                products.push(amazprod[i]);
                products.push(cromaprod[i]);
                
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
    }
    getproducts();
});
app.listen(PORT,()=>{

    console.log(`server is running at port ${PORT}`);
});