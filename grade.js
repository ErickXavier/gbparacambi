document.addEventListener('DOMContentLoaded', function() {

  fetch('grade.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const TiposDeAula = data.classTypes;
      const gradeDeAulas = data.schedule; 
      
      if (!TiposDeAula || !gradeDeAulas) {
        throw new Error('Formato de JSON inválido. Faltando "classTypes" ou "schedule".');
      }
      
      // --- LÓGICA PARA MONTAR A TABELA (sem alterações) ---
      const corpoTabela = document.querySelector('.schedule-table tbody');
      if (corpoTabela) {
        corpoTabela.innerHTML = '';
        const diasDaSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        gradeDeAulas.forEach(itemLinha => {
          const linha = document.createElement('tr');
          const celulaHorario = document.createElement('th');
          celulaHorario.textContent = itemLinha.time;
          linha.appendChild(celulaHorario);
          diasDaSemana.forEach(dia => {
            const celulaAula = document.createElement('td');
            const tipoAulaChave = itemLinha[dia];
            if (tipoAulaChave && TiposDeAula[tipoAulaChave]) {
              const detalhesAula = TiposDeAula[tipoAulaChave];
              const imagem = document.createElement('img');
              imagem.src = `/imgs/${detalhesAula.imagem}`;
              imagem.alt = detalhesAula.label;
              celulaAula.appendChild(imagem);
            }
            linha.appendChild(celulaAula);
          });
          corpoTabela.appendChild(linha);
        });
      }

      // <<< INÍCIO DA NOVA LÓGICA PARA MONTAR A LEGENDA >>>
      const listaLegenda = document.querySelector('.schedule-legend');
      if (listaLegenda) {
        listaLegenda.innerHTML = ''; // Limpa a legenda estática

        // Itera sobre cada tipo de aula definido no JSON
        Object.values(TiposDeAula).forEach(detalhesAula => {
          // Cria o elemento <li>
          const itemLista = document.createElement('li');
          
          // Cria a imagem <img>
          const imagem = document.createElement('img');
          imagem.src = `/imgs/${detalhesAula.imagem}`;
          imagem.alt = detalhesAula.label;
          
          // Cria o texto <span>
          const texto = document.createElement('span');
          // Usamos .innerHTML para renderizar tags como <br> e <small>
          texto.innerHTML = detalhesAula.description; 
          
          // Adiciona a imagem e o texto ao item da lista
          itemLista.appendChild(imagem);
          itemLista.appendChild(texto);
          
          // Adiciona o item da lista à legenda <ul>
          listaLegenda.appendChild(itemLista);
        });
      }
      // <<< FIM DA NOVA LÓGICA PARA MONTAR A LEGENDA >>>
      
    })
    .catch(error => {
      console.error('Falha ao carregar ou processar a grade de horários:', error);
      // Aqui você pode adicionar mensagens de erro na página se desejar
    });
});