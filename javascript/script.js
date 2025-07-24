document.addEventListener("DOMContentLoaded", function () {
    // Idade automatizada
    function atualizarIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);

        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const aniversarioEsseAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());

        if (hoje < aniversarioEsseAno) {
            idade--;
        }

        const spanIdade = document.getElementById("idade");
        if (spanIdade) {
            spanIdade.textContent = idade;
        }
    }

    atualizarIdade("2001-05-19");

    // Anos como escritor automatizado
    function atualizarAnosComoEscritor(dataInicio) {
        const hoje = new Date();
        const inicio = new Date(dataInicio);

        let anos = hoje.getFullYear() - inicio.getFullYear();
        const aniversarioCarreira = new Date(hoje.getFullYear(), inicio.getMonth(), inicio.getDate());

        if (hoje < aniversarioCarreira) {
            anos--;
        }

        const spanAnos = document.getElementById("anos-escritor");
        if (spanAnos) {
            spanAnos.textContent = anos;
        }
    }

    atualizarAnosComoEscritor("2019-05-19");

    // Atualização do ano atual
    function atualizarAnoAtual() {
        const ano = new Date().getFullYear();
        const spanAno = document.getElementById("ano-atual");

        if (spanAno) {
            spanAno.textContent = ano;
        }
    }

    atualizarAnoAtual();

    // Alternar tema com ícone
    const botaoTema = document.getElementById("toggle-tema");
    const iconeTema = document.getElementById("icone-tema");

    function atualizarIconeTema(tema) {
        if (iconeTema) {
            iconeTema.textContent = tema === "claro" ? "🌙" : "☀️";
        }
    }

    // Aplicar tema salvo no carregamento
    const temaSalvo = localStorage.getItem("temaPreferido");
    if (temaSalvo === "claro") {
        document.body.classList.add("modo-claro");
        atualizarIconeTema("claro");
    } else {
        atualizarIconeTema("escuro");
    }

    if (botaoTema) {
        botaoTema.addEventListener("click", function () {
            const modoClaroAtivado = document.body.classList.toggle("modo-claro");

            const temaAtual = modoClaroAtivado ? "claro" : "escuro";
            localStorage.setItem("temaPreferido", temaAtual);
            atualizarIconeTema(temaAtual);
        });
    }

    // Botão de lista
    document.querySelectorAll('.formacao-toggle').forEach(botao => {
        botao.addEventListener('click', () => {
            const formacao = botao.parentElement;
            formacao.classList.toggle('ativa');
        });
    });
});
