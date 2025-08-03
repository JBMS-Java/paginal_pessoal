document.addEventListener("DOMContentLoaded", function () {
    // === Funções de idade e ano ===
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

    function atualizarAnoAtual() {
        const ano = new Date().getFullYear();
        const spanAno = document.getElementById("ano-atual");
        if (spanAno) spanAno.textContent = ano;
    }
    atualizarAnoAtual();

    // === Tema claro/escuro ===
    const botaoTema = document.getElementById("toggle-tema");
    const temaSalvo = localStorage.getItem("temaPreferido");

    if(temaSalvo === "claro") {
        document.body.classList.add("modo-claro");
    }

    if (botaoTema) {
        botaoTema.addEventListener("click", () => {
            const modoClaroAtivado = document.body.classList.toggle("modo-claro");
            const temaAtual = modoClaroAtivado ? "claro" : "escuro";
            localStorage.setItem("temaPreferido", temaAtual);
        });
    }

    // === Formações e barras de progresso com animação ao entrar na tela ===
    const botoes = document.querySelectorAll('.formacao-toggle');

    function animarBarra(botao) {
        const porcentagem = parseInt(botao.getAttribute('data-porcentagem'), 10);
        if (isNaN(porcentagem)) return;

        const spanPorcentagem = botao.querySelector('.porcentagem');
        const barraProgresso = spanPorcentagem.querySelector('.progresso');

        // Evita animar duas vezes
        if (botao.dataset.animado === "true") return;
        botao.dataset.animado = "true";

        // Remove texto antigo se existir
        if (spanPorcentagem.firstChild && spanPorcentagem.firstChild.nodeType === Node.TEXT_NODE) {
            spanPorcentagem.firstChild.remove();
        }

        // Cria o elemento de texto para o número e adiciona no início do span
        const texto = document.createTextNode('0%');
        spanPorcentagem.prepend(texto);

        // Faz a barra começar vazia
        barraProgresso.style.width = '0%';

        // Anima número + barra
        let valorAtual = 0;
        const duracao = 1200; // 1.2 segundos
        const intervalo = 30;
        const passo = Math.max(1, Math.floor(porcentagem / (duracao / intervalo)));

        setTimeout(() => {
            const animacao = setInterval(() => {
                valorAtual += passo;
                if (valorAtual >= porcentagem) {
                    valorAtual = porcentagem;
                    clearInterval(animacao);
                }
                texto.nodeValue = valorAtual + '%';
            }, intervalo);

            // Anima a barra também
            barraProgresso.style.width = porcentagem + '%';
        }, 150);
    }

    // Intersection Observer para detectar quando entra na tela
    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                animarBarra(entrada.target);
            }
        });
    }, { threshold: 0.3 });

    // Observa os botões e adiciona o toggle
    botoes.forEach(botao => {
        observer.observe(botao);

        botao.addEventListener('click', () => {
            const blocoFormacao = botao.parentElement;
            blocoFormacao.classList.toggle('ativa');
        });
    });
});
