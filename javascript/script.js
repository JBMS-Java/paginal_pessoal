document.addEventListener("DOMContentLoaded", function () {
    // Atualiza idade automaticamente a partir da data de nascimento
    function atualizarIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const aniversarioEsseAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
        if (hoje < aniversarioEsseAno) idade--;
        const spanIdade = document.getElementById("idade");
        if (spanIdade) spanIdade.textContent = idade;
    }
    atualizarIdade("2001-05-19");

    // Atualiza anos como escritor a partir da data de início
    function atualizarAnosComoEscritor(dataInicio) {
        const hoje = new Date();
        const inicio = new Date(dataInicio);
        let anos = hoje.getFullYear() - inicio.getFullYear();
        const aniversarioCarreira = new Date(hoje.getFullYear(), inicio.getMonth(), inicio.getDate());
        if (hoje < aniversarioCarreira) anos--;
        const spanAnos = document.getElementById("anos-escritor");
        if (spanAnos) spanAnos.textContent = anos;
    }
    atualizarAnosComoEscritor("2019-05-19");

    // Atualiza o ano atual no elemento especificado
    function atualizarAnoAtual() {
        const ano = new Date().getFullYear();
        const spanAno = document.getElementById("ano-atual");
        if (spanAno) spanAno.textContent = ano;
    }
    atualizarAnoAtual();

    // Elementos para troca de tema
    const botaoTema = document.getElementById("toggle-tema");
    const iconeTema = document.getElementById("icone-tema");

    // Atualiza o ícone do botão de tema (lua ou sol)
    function atualizarIconeTema(tema) {
        if (iconeTema) {
            iconeTema.textContent = tema === "claro" ? "🌙" : "☀️";
        }
    }

    // Aplica tema salvo no localStorage ao carregar a página
    const temaSalvo = localStorage.getItem("temaPreferido");
    if (temaSalvo === "claro") {
        document.body.classList.add("modo-claro");
        atualizarIconeTema("claro");
    } else {
        // Modo escuro é padrão, não adiciona classe
        atualizarIconeTema("escuro");
    }

    // Listener para o botão que alterna o tema
    if (botaoTema) {
        botaoTema.addEventListener("click", () => {
            const modoClaroAtivado = document.body.classList.toggle("modo-claro");
            const temaAtual = modoClaroAtivado ? "claro" : "escuro";
            localStorage.setItem("temaPreferido", temaAtual);
            atualizarIconeTema(temaAtual);
        });
    }

    // Ativa o toggle para expandir/recolher as formações
    const botoes = document.querySelectorAll('.formacao-toggle');
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const blocoFormacao = botao.parentElement;
            blocoFormacao.classList.toggle('ativa');
        });
    });
});
