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

    if (temaSalvo === "claro") {
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

    // === Intersection Observer para Formações e GitHub ===
    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            // Anima barra de formação
            if (entrada.target.classList.contains('formacao-toggle') && entrada.isIntersecting) {
                animarBarra(entrada.target);
            }

            // Mostra cards do GitHub
            if (entrada.target.classList.contains('github-card') && entrada.isIntersecting) {
                entrada.target.classList.add('show');
            }
        });
    }, { threshold: 0.3 });

    // Observa os botões de formação
    botoes.forEach(botao => {
        observer.observe(botao);

        botao.addEventListener('click', () => {
            const blocoFormacao = botao.parentElement;
            blocoFormacao.classList.toggle('ativa');
        });
    });

    // Observa os cards do GitHub
    const githubCards = document.querySelectorAll('.github-cards img');
    githubCards.forEach(card => {
        card.classList.add('github-card'); // adiciona classe para identificar no observer
        observer.observe(card);
    });

    // === Diário de Aprendizado com busca, filtro e paginação ===
    const buscaInput = document.getElementById('busca-diario');
    const filtroTags = document.querySelectorAll('.tag-filtro');
    const entradasWrapper = Array.from(document.querySelectorAll('.diario-entry-wrapper'));
    let tagSelecionada = 'all';
    const itemsPorPagina = 3;
    let paginaAtual = 1;
    let entradasFiltradas = [...entradasWrapper];
    const listaDiario = document.getElementById('lista-diario');

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

        const btnPrev = document.createElement("button");
        btnPrev.textContent = "<";
        btnPrev.classList.add("seta");
        btnPrev.disabled = paginaAtual === 1;
        btnPrev.addEventListener("click", () => renderizarPagina(paginaAtual - 1));
        paginacaoContainer.appendChild(btnPrev);

        for (let i = 1; i <= totalPaginas; i++) {
            const botao = document.createElement("button");
            botao.textContent = i;
            botao.classList.add("pagina-btn");
            if (i === paginaAtual) botao.classList.add("ativo");
            botao.addEventListener("click", () => renderizarPagina(i));
            paginacaoContainer.appendChild(botao);
        }

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

    // === Formulário Contato Interativo ===
    const formContato = document.getElementById('form-contato');
    const feedback = document.getElementById('form-feedback');

    if (formContato) {
        formContato.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = formContato.nome.value.trim();
            const email = formContato.email.value.trim();
            const mensagem = formContato.mensagem.value.trim();

            if (nome.length < 3) {
                feedback.textContent = 'Por favor, insira um nome com pelo menos 3 caracteres.';
                feedback.className = 'erro';
                formContato.nome.focus();
                return;
            }

            if (!validateEmail(email)) {
                feedback.textContent = 'Por favor, insira um email válido.';
                feedback.className = 'erro';
                formContato.email.focus();
                return;
            }

            if (mensagem.length < 10) {
                feedback.textContent = 'A mensagem deve conter pelo menos 10 caracteres.';
                feedback.className = 'erro';
                formContato.mensagem.focus();
                return;
            }

            feedback.textContent = 'Enviando...';
            feedback.className = '';

            setTimeout(() => {
                feedback.textContent = 'Mensagem enviada com sucesso! Obrigado pelo contato.';
                feedback.className = 'sucesso';
                formContato.reset();
            }, 1500);
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }

    // === Botão copiar email no footer ===
    const btnCopiarEmail = document.getElementById('btn-copiar-email');
    const emailParaCopiar = 'joaosanata@gmail.com';

    let msgCopiar = document.getElementById('msg-copiar-email');
    if (!msgCopiar) {
        msgCopiar = document.createElement('div');
        msgCopiar.id = 'msg-copiar-email';
        msgCopiar.style.position = 'fixed';
        msgCopiar.style.bottom = '5rem';
        msgCopiar.style.right = '1rem';
        msgCopiar.style.padding = '0.6rem 1rem';
        msgCopiar.style.backgroundColor = 'rgba(0,0,0,0.8)';
        msgCopiar.style.color = 'white';
        msgCopiar.style.borderRadius = '4px';
        msgCopiar.style.fontSize = '1rem';
        msgCopiar.style.opacity = '0';
        msgCopiar.style.pointerEvents = 'none';
        msgCopiar.style.transition = 'opacity 0.4s ease';
        document.body.appendChild(msgCopiar);
    }

    if (btnCopiarEmail) {
        btnCopiarEmail.addEventListener('click', () => {
            navigator.clipboard.writeText(emailParaCopiar).then(() => {
                msgCopiar.textContent = 'Email copiado para a área de transferência!';
                msgCopiar.style.opacity = '1';
                setTimeout(() => msgCopiar.style.opacity = '0', 2200);
            }).catch(() => {
                msgCopiar.textContent = 'Erro ao copiar o email. Tente manualmente.';
                msgCopiar.style.opacity = '1';
                setTimeout(() => msgCopiar.style.opacity = '0', 2200);
            });
        });
    }

    // === Botão voltar ao topo ===
    const btnVoltarTopo = document.querySelector('.voltar-topo');
    if (btnVoltarTopo) {
        btnVoltarTopo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // === Troca de Idioma ===
    const btnPt = document.getElementById("btn-pt");
    const btnEn = document.getElementById("btn-en");

    const texts = {
        en: {
            sobre: "About me:",
            apresentacao: `Hello! My name is <strong>João Batista Muniz de Santana</strong>, I'm <strong><span id="idade"></span> years old</strong>, I study <a href="https://en.wikipedia.org/wiki/Software_engineering" class="button" target="_blank" rel="external">Software&nbsp;Engineering</a> at <a href="https://www.unilasalle.edu.br/" class="button" target="_blank" rel="external">LaSalle</a> university!`,
            apresentacao2: `I was born and grew up in <strong>Rio de Janeiro</strong> capital <strong>(RJ)</strong>, but today I live in <strong>Canoas</strong>, <strong>Rio Grande do Sul(RS)</strong>, I lived in Rio until I was 20 years old 🙃. I always try to be open to new experiences, I like going out with friends, eat something, enjoy the company and have a good time. I study programming, mainly involving <span><a href="https://pt.wikipedia.org/wiki/HTML5" target="_blank" rel="external"class="button">HTML5</a></span>, <span><a href="https://en.wikipedia.org/wiki/CSS" target="_blank" rel="external" class="button">CSS3</a></span>, <span><a href="https://pt.wikipedia.org/wiki/JavaScript" target="_blank" rel="external" class="button">JS</a></span> and <span><a href="https://en.wikipedia.org/wiki/Python_(programming_language)" target="_blank" rel="external" class="button">Python</a></span>, I am passionate about creating projects, solving problems and I'm also getting into <span><a href="https://en.wikipedia.org/wiki/Machine_learning" target="_blank" rel="external" class="button">Machine Learning (ML)</a></span>, I want to specialize in <span><a href="https://pt.wikipedia.org/wiki/Intelig%C3%AAncia_artificial" target="_blank" rel="external" class="button">AI</a></span> to create useful and creative solutions for society, that can really help people in need.`,
            stacks: `My Stacks`,
            tecnologias: `Favorite Technologies`,
            tecnologias_descricao: `Tools I most enjoy working with`,
            nivel_3: `Advanced`,
            nivel_2: `Intermediary`,
            nivel_1: `Beginner`,
            experiencias_titulo: `Relevant Professional Experiences`,
            data_inicio: `Start: `,
            data_fim: `Exit: `,
            cargo1: `Position: Service Desk Analyst`,
            cargo2: `Position: IT Intern`,
            cargo3: `Position: Junior Operator`,
            empresa1: `Company: HCLTechnologies (HCLTech)`,
            empresa2: `Company: Fundação Hospital Centenário de São Leolpoldo (FHC)`,
            empresa3: `Company: Rede Brasil Gestão de Ativos`,
            descricao1: `I work as a Service Desk Analyst, Bilingual, helping to solve problems, providing assistance at the national and international level.`,
            descricao2: `I worked with IT support, providing solutions to tickets and dealing directly with doctors and other employees in order to deliver the best result possible to the final client: the customer. I participated in projects to improve the hospital's infrastructure, not olny with systems, but with hardware parts (Example: switches). I work as N1, making the first contact and already meeting simple and more complex demands`,
            descricao3: `I worked in the collection operations department, practicing SDR, providing humanized care and smart solutions.`,
            sistemas: `Used Systems:`,
        "botao.download": "Download CV",
        // adicione aqui todas as keys que precisar
        }
    };

    function trocarIdioma(idioma) {
        document.documentElement.setAttribute("lang", idioma === "pt" ? "pt-BR" : "en");

        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const chave = el.getAttribute("data-i18n");
            if (idioma === "pt") {
                el.innerHTML = el.getAttribute("data-original");
            } else {
                el.innerHTML = texts[idioma][chave] || el.getAttribute("data-original");
            }
        });

        // Atualiza classe das bandeiras
        btnPt.classList.toggle("ativa", idioma === "pt");
        btnEn.classList.toggle("ativa", idioma === "en");

        // Salva preferência
        localStorage.setItem("idiomaPreferido", idioma);

        // 🔥 Recalcula os valores dinâmicos após trocar o innerHTML
        atualizarIdade("2001-05-19"); // mesma data que você usa no resto do código
        atualizarAnosComoEscritor("2019-05-19"); // se você usa isso no seu texto
        atualizarAnoAtual(); // se você exibe o ano no footer
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        el.setAttribute("data-original", el.innerHTML);
    });

    btnPt.addEventListener("click", () => trocarIdioma("pt"));
    btnEn.addEventListener("click", () => trocarIdioma("en"));

    const idiomaSalvo = localStorage.getItem("idiomaPreferido") || "pt";
    trocarIdioma(idiomaSalvo);
});
