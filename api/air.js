const H={headers:{'User-Agent':'Mozilla/5.0 (compatible; SAMS/1.0)','Accept':'application/json'}};
const mil=a=>(a.hex||'').toLowerCase().startsWith('ae')&&typeof a.lat==='number'&&a.lat<14&&a.lat>-58&&a.lon>-86&&a.lon<-30;
const MIL=['https://api.adsb.lol/v2/mil','https://api.airplanes.live/v2/mil'];
const PTS=[[8,-70],[-3,-55],[-15,-48],[-25,-45],[-33,-60],[-20,-70]];
async function get(u,tried){
  try{
    const r=await fetch(u,H);
    if(!r.ok){tried.push(u+' -> HTTP '+r.status);return null}
    const j=await r.json();return j.ac||j.aircraft||[];
  }catch(e){tried.push(u+' -> '+((e.cause&&e.cause.code)||e.message));return null}
}
module.exports=async(req,res)=>{
  const tried=[];
  for(const u of MIL){
    const a=await get(u,tried);
    if(a){res.setHeader('Cache-Control','s-maxage=15');return res.status(200).json({ac:a.filter(mil)})}
  }
  let ok=0;
  const lists=await Promise.all(PTS.map(async([la,lo])=>{
    for(const h of ['https://api.adsb.lol','https://api.airplanes.live']){
      const a=await get(`${h}/v2/point/${la}/${lo}/250`,tried);
      if(a){ok++;return a}
    }
    return [];
  }));
  if(!ok)return res.status(502).json({error:'ADS-B indisponível',tried});
  const m={};lists.flat().filter(mil).forEach(a=>{m[a.hex]=a});
  res.setHeader('Cache-Control','s-maxage=15');
  res.status(200).json({ac:Object.values(m)});
};
