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
      
      // --- LÓGICA PARA MONTAR OS CARDS ---
      const scheduleCards = document.querySelector('.schedule-cards');
      if (scheduleCards) {
        scheduleCards.innerHTML = '';
        
        const diasDaSemana = [
          { key: 'monday', nome: 'Segunda' },
          { key: 'tuesday', nome: 'Terça' },
          { key: 'wednesday', nome: 'Quarta' },
          { key: 'thursday', nome: 'Quinta' },
          { key: 'friday', nome: 'Sexta' }
        ];
        
        // Criar um card para cada dia
        diasDaSemana.forEach(dia => {
          const card = document.createElement('div');
          card.className = 'day-card';
          
          // Header do card (nome do dia) - clicável no mobile
          const header = document.createElement('div');
          header.className = 'day-header';
          header.textContent = dia.nome;
          
          // Adicionar seta indicadora
          const arrow = document.createElement('span');
          arrow.className = 'toggle-arrow';
          arrow.innerHTML = '▼';
          header.appendChild(arrow);
          
          // Toggle no mobile
          header.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
              const wasExpanded = card.classList.contains('expanded');
              
              // Se o card clicado já está expandido, apenas fecha ele
              if (wasExpanded) {
                card.classList.remove('expanded');
                
                // Verifica se todos os cards estão fechados agora
                setTimeout(() => {
                  const anyExpanded = document.querySelector('.day-card.expanded');
                  if (!anyExpanded) {
                    // Todos os cards estão fechados, scrolla para o primeiro card
                    const firstCard = document.querySelector('.day-card');
                    if (firstCard) {
                      const cardRect = firstCard.getBoundingClientRect();
                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                      const targetPosition = cardRect.top + scrollTop - 90;
                      
                      window.scrollTo({ 
                        top: targetPosition, 
                        behavior: 'smooth'
                      });
                    }
                  }
                }, 420);
              } else {
                // Fecha todos os outros cards (efeito sanfona)
                document.querySelectorAll('.day-card.expanded').forEach(expandedCard => {
                  expandedCard.classList.remove('expanded');
                });
                // Abre o card clicado
                card.classList.add('expanded');
                
                // Aguarda a animação de expansão completar (400ms) e então scrolla para o card
                setTimeout(() => {
                  const cardRect = card.getBoundingClientRect();
                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                  const targetPosition = cardRect.top + scrollTop - 90;
                  
                  window.scrollTo({ 
                    top: targetPosition, 
                    behavior: 'smooth'
                  });
                }, 420);
              }
            }
          });
          
          card.appendChild(header);
          
          // Container de aulas
          const classesContainer = document.createElement('div');
          classesContainer.className = 'day-classes';
          
          // Para cada horário da grade, verificar se existe aula neste dia
          gradeDeAulas.forEach(itemLinha => {
            const tipoAulaChave = itemLinha[dia.key];
            
            if (tipoAulaChave && TiposDeAula[tipoAulaChave]) {
              // Existe aula neste horário
              const detalhesAula = TiposDeAula[tipoAulaChave];
              
              const classItem = document.createElement('div');
              classItem.className = 'class-item';
              
              const timeSpan = document.createElement('span');
              timeSpan.className = 'class-time';
              timeSpan.textContent = itemLinha.time;
              
              const imagem = document.createElement('img');
              imagem.src = `/imgs/${detalhesAula.imagem}`;
              imagem.alt = detalhesAula.label;
              imagem.title = detalhesAula.label;
              
              classItem.appendChild(timeSpan);
              classItem.appendChild(imagem);
              classesContainer.appendChild(classItem);
            // } else {
            //   // Não existe aula, mas criar espaço vazio para alinhamento
            //   const emptySlot = document.createElement('div');
            //   emptySlot.className = 'class-item empty-slot';
              
            //   const timeSpan = document.createElement('span');
            //   timeSpan.className = 'class-time';
            //   timeSpan.textContent = itemLinha.time;
              
            //   const emptyLabel = document.createElement('span');
            //   emptyLabel.className = 'empty-label';
            //   emptyLabel.textContent = 'Sem aula';
              
            //   emptySlot.appendChild(timeSpan);
            //   emptySlot.appendChild(emptyLabel);
            //   classesContainer.appendChild(emptySlot);
            }
          });
          
          card.appendChild(classesContainer);
          scheduleCards.appendChild(card);
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