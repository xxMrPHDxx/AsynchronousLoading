function findNearest(value, config){
	return config.map(data=>{
		data.diff = Math.abs(data.value - value);
		return data;
	}).reduce((result, current)=>{
		if(current.diff < result.diff)
			return current;
		return result;
	});
}

function draw_tiles(tiles, tileSize){
  for(const {x, y, type} of tiles){
		let col;
		switch(type){
			case 'dirt': col = 'brown'; break;
			case 'water': col = 'blue'; break;
			default: continue;
		}
		noStroke();
		fill(col);
		rect(x, y, tileSize, tileSize);
	}
}

function generateChunk(
	x0, y0, 
	x1, y1, 
	tSize,
	seed
){
  return new Promise((res, rej)=>{
  	const tiles = [];
  	for(let x=x0; x<x1; x+=tSize){
    	for(let y=y0; y<y1; y+=tSize){
				const value = noise(
					x/width, 
					y/height, 
					seed
				);
      	tiles.push({
					x, y,
					type: findNearest(value,[ 
						{ name: 'water', value: 0.24 },
						{ name: 'dirt', value: 0.6 }
					]).name
      	});
    	}
  	}
  	setTimeout(()=>{
			try{
			  draw_tiles(tiles, tSize);
			  res(tiles);
			}catch(e){rej(e);}
		},100);
  }).catch(alert);
}

async function generateTerrain(
  tileSize, 
  chunkSize
){
  try{
		const rows = (height/tileSize)|0;
		const cols = (width/tileSize)|0;
    const crows = (rows/chunkSize)|0;
    const ccols = (cols/chunkSize)|0;
    
		const seed = Math.floor(random(999999));
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
          from_col, from_row,
          end_col > cols ? cols : end_col,
          end_row > rows ? rows : end_row,
					tileSize,
					seed
        ));
	  pct += 100/total;
	  document.querySelector('progress').value = pct;
        }
      }
    return Promise.all(
      [].concat.apply([], chunks)
    );
  }catch(e){return Promise.reject(e);}
}

function setup(){
	createCanvas(640, 640);
	generateTerrain(1, 20)
	.then(tiles=>{
  	alert('Done', tiles.length);
	})
	.catch(alert);
}
