const U=['https://api.adsb.lol/v2/mil','https://api.airplanes.live/v2/mil'];
module.exports=async(req,res)=>{
  for(const u of U){
    try{
      const r=await fetch(u);if(!r.ok)continue;
      const j=await r.json();
      const ac=(j.ac||j.aircraft||[]).filter(a=>(a.hex||'').toLowerCase().startsWith('ae')&&a.lat<14&&a.lat>-58&&a.lon>-86&&a.lon<-30);
      res.setHeader('Cache-Control','s-maxage=15');
      return res.status(200).json({ac});
    }catch(e){}
  }
  res.status(502).json({error:'ADS-B indisponível'});
};
