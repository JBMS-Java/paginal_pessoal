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
    if (temaSalvo === "claro") document.body.classList.add("modo-claro");
    if (botaoTema) {
        botaoTema.addEventListener("click", () => {
            const modoClaroAtivado = document.body.classList.toggle("modo-claro");
            localStorage.setItem("temaPreferido", modoClaroAtivado ? "claro" : "escuro");
        });
    }

    // === Diário de Aprendizado com busca, filtro e paginação ===
    const buscaInput = document.getElementById('busca-diario');
    const filtroTags = document.querySelectorAll('.tag-filtro');
    const entradasWrapper = Array.from(document.querySelectorAll('.diario-entry-wrapper'));
    let tagSelecionada = 'all';
    const itemsPorPagina = 3;
    let paginaAtual = 1;
    let entradasFiltradas = [...entradasWrapper];
    const listaDiario = document.getElementById('lista-diario');

    // Cria container de paginação
    const paginacaoContainer = document.createElement("div");
    paginacaoContainer.classList.add("paginacao");
    listaDiario.after(paginacaoContainer);

    function renderizarPagina(pagina) {
        paginaAtual = pagina;
        entradasWrapper.forEach(item => item.style.display = "none");
        const inicio = (pagina - 1) * itemsPorPagina;
        const fim = inicio + itemsPorPagina;
        entradasFiltradas.slice(inicio, fim).forEach(item => item.style.display = "block");
        atualizarBotoes();
    }

    function atualizarBotoes() {
        paginacaoContainer.innerHTML = "";
        const totalPaginas = Math.ceil(entradasFiltradas.length / itemsPorPagina);

        // Botão voltar
        const btnPrev = document.createElement("button");
        btnPrev.textContent = "<";
        btnPrev.classList.add("seta");
        btnPrev.disabled = paginaAtual === 1;
        btnPrev.addEventListener("click", () => renderizarPagina(paginaAtual - 1));
        paginacaoContainer.appendChild(btnPrev);

        // Botões de números
        for (let i = 1; i <= totalPaginas; i++) {
            const botao = document.createElement("button");
            botao.textContent = i;
            botao.classList.add("pagina-btn");
            if (i === paginaAtual) botao.classList.add("ativo");
            botao.addEventListener("click", () => renderizarPagina(i));
            paginacaoContainer.appendChild(botao);
        }

        // Botão avançar
        const btnNext = document.createElement("button");
        btnNext.textContent = ">";
        btnNext.classList.add("seta");
        btnNext.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
        btnNext.addEventListener("click", () => renderizarPagina(paginaAtual + 1));
        paginacaoContainer.appendChild(btnNext);
    }

    function filtrarEntradas() {
        const termoBusca = buscaInput.value.toLowerCase();
        entradasFiltradas = entradasWrapper.filter(wrapper => {
            const entry = wrapper.querySelector('.diario-entry');
            const titulo = entry.querySelector('h3').textContent.toLowerCase();
            const texto = entry.querySelector('p').textContent.toLowerCase();
            const tags = entry.getAttribute('data-tags').toLowerCase();
            const bateTag = tagSelecionada === 'all' || tags.includes(tagSelecionada.toLowerCase());
            const bateBusca = titulo.includes(termoBusca) || texto.includes(termoBusca);
            return bateTag && bateBusca;
        });
        renderizarPagina(1);
    }

    filtroTags.forEach(btn => {
        btn.addEventListener('click', () => {
            filtroTags.forEach(b => {
                b.setAttribute('aria-pressed', 'false');
                b.style.backgroundColor = 'transparent';
                b.style.color = 'var(--accent-color)';
            });
            btn.setAttribute('aria-pressed', 'true');
            btn.style.backgroundColor = 'var(--accent-color)';
            btn.style.color = 'var(--box-color)';
            tagSelecionada = btn.getAttribute('data-tag');
            filtrarEntradas();
        });
    });

    if (buscaInput) buscaInput.addEventListener('input', filtrarEntradas);

    filtrarEntradas();
});