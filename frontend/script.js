console.log("SCRIPT CARREGOU");

async function carregarBoloes() {

    const container = document.getElementById("boloes-container");

//se na existir pagina nao faz nada// 
    if(!container){
        return;
    }

    container.innerHTML = "<h2>Carregando bolões...</h2>";

    try{

    const response = await fetch("http://localhost:3001/boloes/ativos");
    const boloes = await response.json();

    container.innerHTML = "";

    boloes.forEach(bolao => {

        const data = new Date(bolao.data_sorteio).toLocaleDateString("pt-BR");

        const porcentagem = Number(bolao.porcentagem_preenchida);

        container.innerHTML += `
        <div class="card">

            <h2>${bolao.titulo}</h2>

            <p>Valor da cota: R$ ${bolao.valor_cota}</p>

            <p>Cotas restantes: ${bolao.cotas_restantes}</p>

            <p>Data do sorteio: ${data}</p>

            <div class="barra-container">
                <div class="barra-progresso" style="width:${bolao.porcentagem_preenchida}%"></div>
                </div>
                <p>${bolao.porcentagem_preenchida}% das cotas preenchidas</p>
            <button onclick="reservar('${bolao.titulo}')">
                Reservar pelo WhatsApp
            </button>

        </div>
        `;
    });
} catch (error) {
    console.error("Erro ao carregar bolões", error);
    container.innerHTML="<p>Erro ao carregar bolões.</p>";
}

}
function reservar(titulo){

    const mensagem = encodeURIComponent(`Olá, quero reservar 1 cota do bolão: ${titulo}`);

    window.open(`https://wa.me/5569993363588?text=${mensagem}`, "_blank");
}

carregarBoloes();