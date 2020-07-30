const output = document.querySelector('#output');

function log(...args){
  output.innerText += args.join(' ');
}

function clear(){ output.innerText = ''; }

function generateChunk(r0, c0, r1, c1){
  return new Promise((res, rej)=>{
  const tiles = [];
  for(let row=r0; row<r1; row++){
    for(let col=c0; col<c1; col++){
      tiles.push({
        row, col,
	type: Math.random() > 0.5 ? 
	      'water' : 'dirt'
      });
    }
  }
  setTimeout(()=>res(tiles),1);
  });
}

async function generateTerrain(
  rows, cols, 
  tileSize, 
  chunkSize
){
    try{
      const crows = (rows/chunkSize)|0;
      const ccols = (cols/chunkSize)|0;
      
      const total = crows*ccols;
      let pct = 0;

      const chunks = [];
      for(let i=0; i<crows; i++){
        for(let j=0; j<ccols; j++){
          const from_row = i*chunkSize;
          const from_col = j*chunkSize;
          const end_row = from_row + chunkSize;
          const end_col = from_col + chunkSize;
          chunks.push(await generateChunk(
            from_row, from_col,
            end_row > rows ? rows : end_row,
            end_row > rows ? rows : end_col
          ));
	  pct += 100/total;
	  //clear();
	  //log(`${pct}%`);
	  document.querySelector('progress').value = pct;
        }
      }
    return Promise.all(
      [].concat.apply([], chunks)
    );
  }catch(e){Promise.reject(e);}
}

generateTerrain(100, 100, 16, 10)
.then(tiles=>{
  alert('Done', tiles.length);
})
.catch(alert);
