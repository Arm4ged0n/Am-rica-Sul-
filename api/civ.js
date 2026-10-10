const H={headers:{'User-Agent':'Mozilla/5.0 (compatible; SAMS/1.0)','Accept':'application/json'}};
module.exports=async(req,res)=>{
  const la=+req.query.lat,lo=+req.query.lon;
  if(!isFinite(la)||!isFinite(lo))return res.status(400).json({error:'lat/lon'});
  const tried=[];
  for(const h of ['https://api.adsb.lol','https://api.airplanes.live']){
    const u=`${h}/v2/point/${la.toFixed(2)}/${lo.toFixed(2)}/250`;
    try{
      const r=await fetch(u,H);
      if(!r.ok){tried.push(u+' -> HTTP '+r.status);continue}
      const j=await r.json();
      const ac=(j.ac||j.aircraft||[]).filter(a=>typeof a.lat==='number'&&!(a.dbFlags&1)).slice(0,200);
      res.setHeader('Cache-Control','s-maxage=15');
      return res.status(200).json({ac});
    }catch(e){tried.push(u+' -> '+((e.cause&&e.cause.code)||e.message))}
  }
  res.status(502).json({error:'ADS-B indisponível',tried});
};
