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

function draw_tiles(tiles, tileSize, tilesheet){
  for(const {x, y, type} of tiles){
		noStroke();
		fill(type.color);
		canvas.elt.getContext('2d').drawImage(tilesheet[type.name], x, y);
		// rect(x, y, tileSize, tileSize);
	}
}

function generateChunk(
	x0, y0, 
	x1, y1, 
	tSize,
	seed,
	tilesheet
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
			  draw_tiles(tiles, tSize, tilesheet);
			  res(tiles);
			}catch(e){rej(e);}
		},1);
  }).catch(alert);
}

async function generateTerrain(
  tileSize, 
  chunkSize,
  tilesheet
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
					seed,
					tilesheet
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

function loadTiles(tileSize=16){
	const imgs = {
		'dirt': 'img/dirt.jpg',
		'sand': 'img/sand.jpg',
		'water': 'img/water.jpg'
	}
	return Promise.all(
		Object
		.entries(imgs)
		.map(([name, path])=>{
		return new Promise((res, rej)=>{
			const canvas = document.createElement('canvas');
			const img = new Image();
			img.onload = ()=>{
				canvas.width = canvas.height = tileSize;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, tileSize, tileSize);
				res({name, img: canvas});
			};
			img.onerror = rej;
			img.src = path;
		});
	}))
	.then(imgs=>{
		return imgs.reduce((obj, {name, img})=>{
			obj[name] = img; return obj;
		}, {});
	});	
}

let canvas;

function setup(){
	canvas = createCanvas(2048, 2048);
	loadTiles()
	.then(tilesheet=>generateTerrain(16, 16, tilesheet))
	.then(tiles=>{
  	alert('Done');
	})
	.catch(alert);
}
