function showLoader(){
	const loader = document.getElementById('loader');
	if(loader) loader.classList.remove('d-none');
}

function hideLoader(){
	const loader = document.getElementById('loader');
	if(loader) loader.classList.add('d-none');
}

window.addEventListener('load', ()=>{
	setTimeout(()=>{
		hideLoader();
	},700);
});


window.showLoader = showLoader;
window.hideLoader = hideLoader;
