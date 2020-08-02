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
		noStroke();
		fill(type.color);
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
  	for(let xc=x0; xc<x1; xc++){
    	for(let yc=y0; yc<y1; yc++){
				const x = xc*tSize;
				const y = yc*tSize;
				const value = noise(
					x/width, 
					y/height, 
					seed
				);
      	tiles.push({
					x, y,
					type: findNearest(value,[ 
						{
							name: 'water',
							value: 0.22,
							color: '#0000afff'
						},
						{ 
							name: 'dirt',
							value: 0.56,
							color: '#76552bff'
						},
						{
							name: 'sand',
							value: 0.77,
							color: '#c2b280ff'
						}
					])
      	});
    	}
  	}
  	setTimeout(()=>{
			try{
			  draw_tiles(tiles, tSize);
			  res(tiles);
			}catch(e){rej(e);}
		},1);
  }).catch(alert);
}

async function generateTerrain(
  tileSize, 
  chunkSize
){
  try{
		alert(width + ',' + height);
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
	createCanvas(1024, 1024);
	generateTerrain(4, 16)
	.then(tiles=>{
  	alert('Done', tiles.length);
	})
	.catch(alert);
}
