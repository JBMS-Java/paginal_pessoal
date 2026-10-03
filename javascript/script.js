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

    function gerarIconeFormacao(titulo) {
        const texto = titulo.trim();

        if (/ENGENHARIA|SOFTWARE/i.test(texto)) return 'fa-solid fa-code';
        if (/INGLÊS|ENGLISH/i.test(texto)) return 'fi fi-us';
        if (/ESPANHOL|SPANISH/i.test(texto)) return 'fi fi-es';
        if (/HTML/i.test(texto)) return 'fa-brands fa-html5';
        if (/CSS/i.test(texto)) return 'fa-brands fa-css3-alt';
        if (/JAVASCRIPT|JS/i.test(texto)) return 'fa-brands fa-js';
        if (/PYTHON/i.test(texto)) return 'fa-brands fa-python';
        if (/SQL/i.test(texto)) return 'fa-solid fa-database';
        if (/PHP/i.test(texto)) return 'fa-brands fa-php';
        if (/REACT/i.test(texto)) return 'fa-brands fa-react';
        if (/GIT/i.test(texto)) return 'fa-brands fa-git-alt';
        if (/MACHINE|APRENDIZADO/i.test(texto)) return 'fa-solid fa-brain';

        return 'fa-solid fa-graduation-cap';
    }

    function configurarHoverVisual(botao) {
        const visual = botao.querySelector('.formacao-visual');
        if (!visual || visual.dataset.hoverAtivado === 'true') return;

        visual.dataset.hoverAtivado = 'true';
        visual.addEventListener('mouseenter', () => {
            visual.classList.add('is-hovered');
        });
        visual.addEventListener('mouseleave', () => {
            visual.classList.remove('is-hovered');
        });
    }

    function animarBarra(botao) {
        const porcentagem = parseInt(botao.getAttribute('data-porcentagem'), 10);
        if (isNaN(porcentagem)) return;

        let spanPorcentagem = botao.querySelector('.porcentagem');
        let visual = botao.querySelector('.formacao-visual');

        if (!spanPorcentagem || !visual) {
            const titulo = botao.querySelector('.titulo');
            const visualNovo = document.createElement('div');
            visualNovo.className = 'formacao-visual';
            visualNovo.style.setProperty('--progress', '0');
            const icon = document.createElement('span');
            icon.className = 'formacao-icon';
            icon.className += ' ' + gerarIconeFormacao(titulo ? titulo.textContent : '');
            visualNovo.appendChild(icon);

            const seta = botao.querySelector('.icone-seta');
            const alvoInsercao = seta ? seta.nextSibling : botao.firstChild;
            botao.insertBefore(visualNovo, alvoInsercao);

            const novoSpan = document.createElement('span');
            novoSpan.className = 'percent-value';
            novoSpan.textContent = '0%';
            const spanMeta = botao.querySelector('.porcentagem');
            if (spanMeta) {
                spanMeta.appendChild(novoSpan);
            }

            spanPorcentagem = botao.querySelector('.porcentagem');
            visual = botao.querySelector('.formacao-visual');
        }

        configurarHoverVisual(botao);

        if (botao.dataset.animado === 'true') return;
        botao.dataset.animado = 'true';

        const valorTexto = spanPorcentagem.querySelector('.percent-value') || document.createElement('span');
        valorTexto.className = 'percent-value';
        if (!valorTexto.parentElement) {
            spanPorcentagem.appendChild(valorTexto);
        }
        valorTexto.textContent = '0%';

        const icon = visual.querySelector('.formacao-icon') || document.createElement('span');
        if (!icon.parentElement) {
            icon.className = 'formacao-icon';
            visual.appendChild(icon);
        }
        const titulo = botao.querySelector('.titulo');
        icon.className = 'formacao-icon ' + gerarIconeFormacao(titulo ? titulo.textContent : '');

        let valorAtual = 0;
        const duracao = 1200;
        const intervalo = 30;
        const passo = Math.max(1, Math.floor(porcentagem / (duracao / intervalo)));

        visual.style.setProperty('--progress', '0');

        setTimeout(() => {
            const animacao = setInterval(() => {
                valorAtual += passo;
                if (valorAtual >= porcentagem) {
                    valorAtual = porcentagem;
                    clearInterval(animacao);
                }
                visual.style.setProperty('--progress', String(valorAtual));
                valorTexto.textContent = valorAtual + '%';
            }, intervalo);
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

        configurarHoverVisual(botao);

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
    const listaDiario = document.getElementById('lista-diario');
    let tagSelecionada = 'all';
    const itemsPorPagina = 3;
    let paginaAtual = 1;
    let entradasWrapper = Array.from(document.querySelectorAll('.diario-entry-wrapper'));
    let entradasFiltradas = [...entradasWrapper];

    const paginacaoContainer = document.createElement("div");
    paginacaoContainer.classList.add("paginacao");
    if (listaDiario) listaDiario.after(paginacaoContainer);

    function criarEntradaDiario(nota) {
        const wrapper = document.createElement('div');
        wrapper.className = 'diario-entry-wrapper';
        wrapper.dataset.origem = 'dicionario';
        wrapper.dataset.notaId = String(nota.id);
        const categorias = obterCategoriasNota(nota);

        const article = document.createElement('article');
        article.className = 'diario-entry';
        article.dataset.tags = categorias.join(',');

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'diario-remove';
        removeButton.textContent = '✕';
        removeButton.title = 'Remover nota';
        removeButton.setAttribute('aria-label', 'Remover nota');
        removeButton.addEventListener('click', async () => {
            try {
                await apiRequest(`/api/notes/${nota.id}`, { method: 'DELETE' });
                await carregarNotasServidor();
            } catch (error) {
                alert(error.message);
            }
        });

        const titulo = document.createElement('h3');
        titulo.textContent = nota.palavra;

        const time = document.createElement('time');
        const data = new Date(nota.id);
        time.dateTime = data.toISOString().slice(0, 10);
        time.textContent = data.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const texto = document.createElement('p');
        texto.textContent = nota.nota;

        const tags = document.createElement('div');
        tags.className = 'diario-tags';
        categorias.forEach(categoria => {
            const tag = document.createElement('span');
            tag.className = 'diario-tag';
            tag.textContent = categoria;
            tags.appendChild(tag);
        });

        article.appendChild(removeButton);
        article.appendChild(titulo);
        article.appendChild(time);
        article.appendChild(texto);
        article.appendChild(tags);
        wrapper.appendChild(article);
        return wrapper;
    }

    function renderizarPagina(pagina) {
        if (!listaDiario) return;
        paginaAtual = pagina;
        entradasWrapper.forEach(item => item.style.display = 'none');
        const inicio = (pagina - 1) * itemsPorPagina;
        const fim = inicio + itemsPorPagina;
        entradasFiltradas.slice(inicio, fim).forEach(item => item.style.display = 'block');
        atualizarBotoes();
    }

    function atualizarBotoes() {
        paginacaoContainer.innerHTML = "";
        const totalPaginas = Math.ceil(entradasFiltradas.length / itemsPorPagina);

        const btnPrev = document.createElement("button");
        btnPrev.textContent = "<";
        btnPrev.classList.add("seta");
        btnPrev.disabled = paginaAtual === 1 || totalPaginas === 0;
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
        if (!buscaInput || !listaDiario) return;
        const termoBusca = buscaInput.value.toLowerCase();
        entradasFiltradas = entradasWrapper.filter(wrapper => {
            const entry = wrapper.querySelector('.diario-entry');
            if (!entry) return false;
            const titulo = entry.querySelector('h3')?.textContent.toLowerCase() || '';
            const texto = entry.querySelector('p')?.textContent.toLowerCase() || '';
            const tags = (entry.getAttribute('data-tags') || '').toLowerCase();
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

    // === Dicionário pessoal ===
    const STORAGE_KEY_DICIONARIO = 'dicionario-pessoal-notas';
    const formDicionario = document.getElementById('form-dicionario');
    const listaDicionario = document.getElementById('lista-dicionario');
    const palavraInput = document.getElementById('dicionario-palavra');
    const notaInput = document.getElementById('dicionario-nota');
    const categoriaCheckboxes = Array.from(document.querySelectorAll('.dicionario-categoria-checkbox'));
    const acessoDicionario = document.getElementById('dicionario-acesso');
    const contatoInbox = document.getElementById('contato-inbox');
    const listaMensagens = document.getElementById('lista-mensagens');
    const mensagensFeedback = document.getElementById('mensagens-feedback');
    const btnAcessar = document.getElementById('btn-dicionario-acessar');
    const btnSair = document.getElementById('btn-dicionario-sair');
    const btnAtualizarMensagens = document.getElementById('btn-atualizar-mensagens');
    let notasDicionario = [];

    function normalizarCategorias(valor) {
        const categorias = Array.isArray(valor) ? valor : [valor];
        return categorias.map(item => String(item || '').trim()).filter(Boolean);
    }

    function obterCategoriasNota(nota) {
        return normalizarCategorias(nota?.categorias ?? nota?.categoria).length
            ? normalizarCategorias(nota?.categorias ?? nota?.categoria)
            : ['React'];
    }

    function apiRequest(url, options = {}) {
        if (location.protocol === 'file:') {
            return Promise.reject(new Error('Abra o site por http://127.0.0.1:8000/ para enviar mensagens.'));
        }

        const headers = new Headers(options.headers || {});
        if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        return fetch(url, { ...options, headers, credentials: 'same-origin' })
            .then(async response => {
                const body = await response.text();
                let result;
                try {
                    result = JSON.parse(body);
                } catch (error) {
                    throw new Error(`O servidor respondeu com um formato inesperado (HTTP ${response.status}).`);
                }
                if (!response.ok) throw new Error(result.error || `Falha no servidor (HTTP ${response.status}).`);
                return result;
            })
            .catch(error => {
                if (error instanceof TypeError) {
                    throw new Error('Não consegui conectar ao backend. Verifique se o servidor está rodando e abra http://127.0.0.1:8000/.');
                }
                throw error;
            });
    }

    function carregarNotasDicionario() {
        return notasDicionario;
    }

    function carregarNotasLegadas() {
        try {
            const notas = JSON.parse(localStorage.getItem(STORAGE_KEY_DICIONARIO) || '[]');
            return Array.isArray(notas)
                ? notas.map(nota => ({ ...nota, categorias: obterCategoriasNota(nota) }))
                : [];
        } catch (error) {
            return [];
        }
    }

    async function importarNotasLegadas() {
        const notas = carregarNotasLegadas();
        if (!notas.length) return;
        await apiRequest('/api/notes/import', { method: 'POST', body: JSON.stringify({ notes: notas }) });
        localStorage.removeItem(STORAGE_KEY_DICIONARIO);
    }

    function setAcessoDicionario(liberado) {
        formDicionario?.classList.toggle('dicionario-oculto', !liberado);
        acessoDicionario?.classList.toggle('dicionario-oculto', liberado);
        contatoInbox?.classList.toggle('dicionario-oculto', !liberado);
    }

    function renderizarDicionario() {
        if (!listaDicionario) return;
        listaDicionario.replaceChildren();
        if (!notasDicionario.length) {
            const vazio = document.createElement('div');
            vazio.className = 'dicionario-vazio';
            vazio.textContent = 'Ainda não há notas no dicionário.';
            listaDicionario.appendChild(vazio);
            return;
        }

        notasDicionario.forEach(nota => {
            const item = document.createElement('article');
            item.className = 'item-dicionario';
            const remover = document.createElement('button');
            remover.type = 'button';
            remover.textContent = '✕';
            remover.setAttribute('aria-label', 'Remover nota');
            remover.addEventListener('click', async () => {
                try {
                    await apiRequest(`/api/notes/${nota.id}`, { method: 'DELETE' });
                    await carregarNotasServidor();
                } catch (error) {
                    alert(error.message);
                }
            });
            const titulo = document.createElement('h3');
            titulo.textContent = nota.palavra;
            const tags = document.createElement('div');
            tags.className = 'diario-tags';
            obterCategoriasNota(nota).forEach(categoria => {
                const tag = document.createElement('span');
                tag.className = 'diario-tag';
                tag.textContent = categoria;
                tags.appendChild(tag);
            });
            const texto = document.createElement('p');
            texto.textContent = nota.nota;
            item.append(remover, titulo, tags, texto);
            listaDicionario.appendChild(item);
        });
    }

    function renderizarNotasDicionarioNoDiario() {
        if (!listaDiario) return;
        listaDiario.querySelectorAll('.diario-entry-wrapper[data-origem="dicionario"]').forEach(item => item.remove());
        notasDicionario.slice().sort((a, b) => Number(b.id) - Number(a.id)).forEach(nota => {
            listaDiario.appendChild(criarEntradaDiario(nota));
        });
        entradasWrapper = Array.from(document.querySelectorAll('.diario-entry-wrapper'));
    }

    async function carregarNotasServidor() {
        notasDicionario = await apiRequest('/api/notes');
        renderizarDicionario();
        renderizarNotasDicionarioNoDiario();
        filtrarEntradas();
    }

    function renderizarMensagens(mensagens) {
        if (!listaMensagens) return;
        listaMensagens.replaceChildren();
        if (!mensagens.length) {
            const vazio = document.createElement('p');
            vazio.className = 'dicionario-vazio';
            vazio.textContent = 'Nenhuma mensagem recebida ainda.';
            listaMensagens.appendChild(vazio);
            return;
        }
        mensagens.forEach(mensagem => {
            const item = document.createElement('article');
            item.className = 'item-mensagem';
            const cabecalho = document.createElement('div');
            cabecalho.className = 'mensagem-cabecalho';
            const nome = document.createElement('h4');
            nome.textContent = mensagem.nome;
            const remover = document.createElement('button');
            remover.type = 'button';
            remover.className = 'mensagem-remover';
            remover.textContent = 'Remover';
            remover.addEventListener('click', async () => {
                try {
                    await apiRequest(`/api/messages/${mensagem.id}`, { method: 'DELETE' });
                    await carregarMensagens();
                } catch (error) {
                    if (mensagensFeedback) mensagensFeedback.textContent = error.message;
                }
            });
            const email = document.createElement('a');
            email.href = `mailto:${encodeURIComponent(mensagem.email)}`;
            email.textContent = mensagem.email;
            const data = document.createElement('time');
            data.dateTime = mensagem.criadaEm;
            data.textContent = new Date(mensagem.criadaEm).toLocaleString('pt-BR');
            const texto = document.createElement('p');
            texto.textContent = mensagem.mensagem;
            cabecalho.append(nome, remover);
            item.append(cabecalho, email, data, texto);
            listaMensagens.appendChild(item);
        });
    }

    async function carregarMensagens() {
        renderizarMensagens(await apiRequest('/api/messages'));
        if (mensagensFeedback) mensagensFeedback.textContent = '';
    }

    if (formDicionario && listaDicionario && palavraInput && notaInput) {
        setAcessoDicionario(false);
        renderizarDicionario();
        btnAcessar?.addEventListener('click', async () => {
            const password = prompt('Digite a senha do dicionário pessoal:');
            if (password === null) return;
            try {
                await apiRequest('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
                setAcessoDicionario(true);
                await importarNotasLegadas();
                await carregarNotasServidor();
                await carregarMensagens();
                palavraInput.focus();
            } catch (error) {
                setAcessoDicionario(false);
                alert(error.message === 'Senha incorreta.' ? error.message : `Não foi possível acessar: ${error.message}`);
            }
        });
        btnSair?.addEventListener('click', async () => {
            try {
                await apiRequest('/api/admin/logout', { method: 'POST', body: '{}' });
            } finally {
                setAcessoDicionario(false);
                listaMensagens?.replaceChildren();
            }
        });
        btnAtualizarMensagens?.addEventListener('click', () => carregarMensagens().catch(error => {
            if (mensagensFeedback) mensagensFeedback.textContent = error.message;
        }));
        formDicionario.addEventListener('submit', async event => {
            event.preventDefault();
            const palavra = palavraInput.value.trim();
            const nota = notaInput.value.trim();
            const categorias = categoriaCheckboxes.filter(item => item.checked).map(item => item.value);
            if (!palavra || !nota || !categorias.length) {
                alert('Selecione pelo menos uma categoria para a nota.');
                return;
            }
            try {
                await apiRequest('/api/notes', { method: 'POST', body: JSON.stringify({ palavra, nota, categorias }) });
                formDicionario.reset();
                await carregarNotasServidor();
                palavraInput.focus();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    apiRequest('/api/session').then(async session => {
        await carregarNotasServidor();
        if (!session.authenticated) return;
        setAcessoDicionario(true);
        await importarNotasLegadas();
        await carregarNotasServidor();
        await carregarMensagens();
    }).catch(error => {
        if (listaDicionario) listaDicionario.textContent = `Backend indisponível: ${error.message}`;
    });

    const formContato = document.getElementById('form-contato');
    const feedback = document.getElementById('form-feedback');
    if (formContato) {
        formContato.addEventListener('submit', async event => {
            event.preventDefault();
            const formData = new FormData(formContato);
            const nome = String(formData.get('nome') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const mensagem = String(formData.get('mensagem') || '').trim();
            if (nome.length < 3) {
                feedback.textContent = idiomaAtual === 'en' ? texts.en.name_error : 'Por favor, insira um nome com pelo menos 3 caracteres.';
                feedback.className = 'erro';
                formContato.elements.namedItem('nome').focus();
                return;
            }
            if (!validateEmail(email)) {
                feedback.textContent = idiomaAtual === 'en' ? texts.en.email_error : 'Por favor, insira um email válido.';
                feedback.className = 'erro';
                formContato.elements.namedItem('email').focus();
                return;
            }
            if (mensagem.length < 10 || mensagem.length > 3000) {
                feedback.textContent = idiomaAtual === 'en' ? texts.en.message_error : 'A mensagem deve conter entre 10 e 3000 caracteres.';
                feedback.className = 'erro';
                formContato.elements.namedItem('mensagem').focus();
                return;
            }
            feedback.textContent = idiomaAtual === 'en' ? texts.en.sending : 'Enviando...';
            feedback.className = '';
            const botaoEnviar = formContato.querySelector('button[type="submit"]');
            if (botaoEnviar) botaoEnviar.disabled = true;
            try {
                await apiRequest('/api/messages', {
                    method: 'POST',
                    body: JSON.stringify({ nome, email, mensagem, website: String(formData.get('website') || '') })
                });
                feedback.textContent = idiomaAtual === 'en' ? texts.en.sent : 'Mensagem enviada com sucesso. Obrigado pelo contato.';
                feedback.className = 'sucesso';
                formContato.reset();
            } catch (error) {
                feedback.textContent = idiomaAtual === 'en' ? `Could not send: ${error.message}` : `Não foi possível enviar: ${error.message}`;
                feedback.className = 'erro';
            } finally {
                if (botaoEnviar) botaoEnviar.disabled = false;
            }
        });
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
    }

    const btnCopiarEmail = document.getElementById('btn-copiar-email');
    if (btnCopiarEmail) {
        btnCopiarEmail.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText('joaosanata@gmail.com');
                alert(texts.en.email_copied);
            } catch (error) {
                alert(texts.en.email_copy_error);
            }
        });
    }

    let idiomaAtual = 'pt';
    const texts = {
        en: {
            formacoes: "Education & Training",
            ES: "Software Engineering",
            graduacao: "Level: Undergraduate",
            ES_graduacao: "Studying Software Engineering at LaSalle, currently in my 6th semester.",
            IN_lingua: "Level: Fluent",
            IN_descricao: "I studied English for five years at Western's and still practice speaking, writing, and listening. My goal is to speak English like a native.",
            ES_lingua: "Level: Beginner",
            ES_descricao: "I'm beginning a Spanish course at KNN Idiomas.",
            nivel_3_level: "Level: Advanced",
            nivel_2_level: "Level: Intermediate",
            nivel_1_level: "Level: Beginner",
            HTML_descricao: "I completed an HTML5 course on Udemy with Matheus Battisti and Gustavo Guanabara, covering concepts from the basics to more advanced topics. I'm now practicing to strengthen and expand my skills.",
            CSS_descricao: "I studied HTML5 and CSS3 on Udemy with Matheus Battisti and Gustavo Guanabara. I'm continuing to develop my CSS skills, including animation, through hands-on practice.",
            JS_descricao: "I'm studying JavaScript on Udemy with Matheus Battisti. I'm reinforcing the fundamentals and beginning to explore intermediate concepts.",
            py_descricao: "I'm starting a Python course on Udemy. I have some previous experience with the language and am now focusing on building a deeper understanding of more advanced concepts.",
            sql_title: "SQL (Data Analysis)",
            sql_description: "I'm starting André Krul's Udemy course, SQL for Data Analysis: From Basics to Advanced.",
            php_description: "I'm studying PHP through Rodrigo Luiz Barbosa de Souza's Udemy course, PHP 8 Complete: Updated Web Development Course (2025).",
            react_description: "I have a React course with Matheus Battisti on Udemy lined up; I haven't started it yet.",
            git_description: "I completed Gustavo Guanabara's Git course, learning to version code with local repositories and publish projects on GitHub. I'm continuing to improve through practice.",
            machine_learning_description: "My Udemy Machine Learning course is coming up, and I plan to start it alongside Python.",
            featured_projects: "Featured Projects",
            portfolio_preview_alt: "Portfolio preview",
            portfolio_project: "Portfolio",
            portfolio_description: "My personal portfolio, built with HTML, CSS, and JavaScript.",
            view_project: "View project",
            coming_soon_alt: "Project coming soon",
            coming_soon: "Coming soon",
            upcoming_projects: "More projects will appear here...",
            github_stats: "GitHub Statistics",
            github_description: "A snapshot of my GitHub contributions",
            github_stats_alt: "GitHub statistics",
            github_languages_alt: "Most-used languages on GitHub",
            github_profile: "→ View my GitHub profile",
            learning_journal: "📓 Learning Journal",
            journal_intro: "Notes and reflections on my progress.",
            journal_search_placeholder: "Search the journal...",
            journal_search_label: "Search the learning journal",
            filter_all: "All",
            spanish_filter: "Spanish",
            journal_react_title: "Learning React: Getting started",
            journal_react_date: "August 1, 2025",
            journal_react_entry: "I started learning React and really enjoyed understanding how components work...",
            journal_css_title: "CSS Grid challenges",
            journal_css_date: "August 5, 2025",
            journal_css_entry: "I got a better understanding of spacing and how to use fr units in responsive layouts...",
            hobbies_title: "My hobbies:",
            hobby_read_title: "Reading:",
            hobby_read: "In my free time, I love reading. I enjoy everything from educational material to romance and suspense, but fiction is my favorite genre.",
            hobby_write_title: "Writing:",
            hobby_write: "<span>I'm a writer who loves storytelling, with more than 20 books published on Amazon over </span><span id=\"anos-escritor\"></span><span> years. They all belong to the same universe, which I continue to build with care whenever I have time.</span>",
            hobby_games_title: "Gaming:",
            hobby_games: "I have an Xbox Series S and enjoy many kinds of games, especially RPGs, competitive games, and horror.",
            hobby_fitness_title: "Working out:",
            hobby_fitness: "I enjoy exercise and like to keep a consistent workout routine.",
            hobby_movies_title: "Movies:",
            hobby_movies: "I love great entertainment. Cinema and the craft behind the seventh art are among my favorite pastimes.",
            hobby_anime_title: "Anime:",
            hobby_anime: "I love Dragon Ball and Naruto, and I'm always open to recommendations for other great anime!",
            contact_title: "Interactive Contact",
            name_label: "Name:",
            name_placeholder: "Your name",
            email_label: "Email:",
            email_placeholder: "you@email.com",
            message_label: "Message:",
            message_placeholder: "Your message",
            send_message: "Send",
            social_links: "Find me online:",
            copyright: "&copy; <span id=\"ano-atual\"></span> João Muniz. All rights reserved.",
            footer_quote: "\"Work done with love isn't work.\"",
            copy_email: "Copy email address",
            back_to_top: "↑ Back to top",
            name_error: "Please enter a name with at least 3 characters.",
            email_error: "Please enter a valid email address.",
            message_error: "Your message must contain at least 10 characters.",
            sending: "Sending...",
            sent: "Message sent successfully. Thank you for reaching out!",
            email_copied: "Email copied to the clipboard!",
            email_copy_error: "Couldn't copy the email. Please copy it manually."
        }
    };

    const btnPt = document.getElementById('btn-pt');
    const btnEn = document.getElementById('btn-en');

    function trocarIdioma(idioma) {
        idiomaAtual = idioma === "en" ? "en" : "pt";
        document.documentElement.setAttribute("lang", idiomaAtual === "pt" ? "pt-BR" : "en");

        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const chave = el.getAttribute("data-i18n");
            if (idiomaAtual === "pt") {
                el.innerHTML = el.getAttribute("data-original");
            } else {
                el.innerHTML = texts.en[chave] || el.getAttribute("data-original");
            }
        });

        document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
            el.getAttribute("data-i18n-attr").split(",").forEach((item) => {
                const [attribute, key] = item.split(":").map((part) => part.trim());
                const original = el.getAttribute(`data-original-${attribute}`);
                el.setAttribute(attribute, idiomaAtual === "pt" ? original : texts.en[key] || original);
            });
        });

        // Atualiza classe das bandeiras
        btnPt.classList.toggle("ativa", idiomaAtual === "pt");
        btnEn.classList.toggle("ativa", idiomaAtual === "en");

        // Salva preferência
        localStorage.setItem("idiomaPreferido", idiomaAtual);

        // 🔥 Recalcula os valores dinâmicos após trocar o innerHTML
        atualizarIdade("2001-05-19"); // mesma data que você usa no resto do código
        atualizarAnosComoEscritor("2019-05-19"); // se você usa isso no seu texto
        atualizarAnoAtual(); // se você exibe o ano no footer
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        el.setAttribute("data-original", el.innerHTML);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
        el.getAttribute("data-i18n-attr").split(",").forEach((item) => {
            const [attribute] = item.split(":").map((part) => part.trim());
            el.setAttribute(`data-original-${attribute}`, el.getAttribute(attribute));
        });
    });

    btnPt.addEventListener("click", () => trocarIdioma("pt"));
    btnEn.addEventListener("click", () => trocarIdioma("en"));

    const idiomaSalvo = localStorage.getItem("idiomaPreferido") || "pt";
    trocarIdioma(idiomaSalvo);
});