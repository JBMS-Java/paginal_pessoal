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
    const emailParaCopiar = 'joaosanata@gmail.com'; // <<< substitua pelo seu email real

    // Cria a div para mostrar feedback de cópia, se ainda não existir
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

                setTimeout(() => {
                    msgCopiar.style.opacity = '0';
                }, 2200);
            }).catch(() => {
                msgCopiar.textContent = 'Erro ao copiar o email. Tente manualmente.';
                msgCopiar.style.opacity = '1';

                setTimeout(() => {
                    msgCopiar.style.opacity = '0';
                }, 2200);
            });
        });
    }

    // === Botão voltar ao topo ===
    const btnVoltarTopo = document.querySelector('.voltar-topo');
    if (btnVoltarTopo) {
        btnVoltarTopo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});