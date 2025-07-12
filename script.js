function atualizarIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

let idade = hoje.getFullYear() - nascimento.getFullYear();
const aniversarioEsseAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());

if(hoje < aniversarioEsseAno) {
    idade--;
}

    const spanIdade = document.getElementById("idade");
    if(spanIdade) {
        spanIdade.textContent = idade;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarIdade("2001-05-19");
})