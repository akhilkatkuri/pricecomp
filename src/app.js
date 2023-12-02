const button=document.getElementById('search');
const productname=document.getElementById('productname')
const proddisplay=document.querySelector('#productsid');
let pdiv;
button.addEventListener('click',()=>{
        proddisplay.innerHTML='';
        const data1={text:productname.value};
        fetch('http://localhost:8000/product',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(data1)
    }).then(response=>response.text())
    .then(data=>console.log(data))
    .catch(error=>console.log(error))
    fetch('http://localhost:8000')
    .then(response=>{return response.json()})
    .then(data=>{
        for(let i=0;i<data.length;i++)
        {
            pdiv=document.createElement('div');
            const idiv=document.createElement('div');
            const cdiv=document.createElement('div');
            const ppdiv=document.createElement('div');
            idiv.style.width="300px";
            idiv.style.height="450px";
            idiv.style.overflow="hidden";
            cdiv.classList.add('indprod');
            pdiv.classList.add('pofprod');
            const img=document.createElement('img')
            img.src=data[i].Imgurl;
            img.style.height="auto";
            img.style.width="70%";
            img.style.objectFit="cover";
            const productname=document.createElement('h3');
            productname.innerHTML=data[i].Productname;
            let url=document.createElement('a');
            url.style.textDecoration="none";
            url.style.fontSize="20.8px"
            url.style.color="black";
            url.href=data[i].Url;
            url.target="_blank";
            url.innerHTML=productname.innerText;
            const price1=document.createElement('h3');
            price1.innerHTML=data[i].Price;
            const logo=document.createElement("img");
            if(data[i].Logo=='flipkart')
            {
                logo.src="../logos/flipimg.png";
            }
            if(data[i].Logo=='amazon')
            {
                logo.src="../logos/amazlogo.png";
            }
            if(data[i].Logo=='croma')
            {
                logo.src="../logos/cromaimg.png";
            }
            logo.style.height="20px";
            logo.style.height="40px";
            idiv.appendChild(img);
            cdiv.appendChild(url);
            cdiv.appendChild(price1);
            cdiv.appendChild(logo);
            pdiv.appendChild(idiv);
            pdiv.appendChild(cdiv);
            pdiv.style.display="flex";
            ppdiv.appendChild(pdiv);
            // pdiv.style.display="column";
            proddisplay.insertAdjacentHTML("beforeend",ppdiv.innerHTML);
        }
        
    });

});
pdiv.addEventListener("mouseenter",function(){
    url.style.color="blue";
})
pdiv.addEventListener("mouseleave",function(){
    url.style.color="black";
})

