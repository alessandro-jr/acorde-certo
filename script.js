// Solicitar permissão para notificações
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permissão para notificações concedida.');
            } else {
                console.log('Permissão para notificações negada.');
            }
        });
    }
}

// Tocar o som e exibir a notificação
function triggerAlarm() {
    const alarmSound = document.getElementById('alarm-sound');
    alarmSound.play();

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Alarme!', {
            body: 'Seu alarme está tocando!',
            icon: 'assets/icons/alarm-icon.png', // Ícone opcional
        });
    }
}

// Verificar se o alarme deve tocar
function checkAlarm() {
    const savedAlarm = localStorage.getItem('alarmeHorario');
    if (!savedAlarm) return;

    const now = new Date();
    const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (savedAlarm === currentTime) {
        triggerAlarm(); // Toca o alarme e exibe a notificação
    }
}

// Configura para verificar o alarme a cada minuto
setInterval(checkAlarm, 60000); // Verifica a cada 60 segundos

// Salvar o alarme no LocalStorage
function salvarAlarme() {
    const horarioSelecionado = '08:30'; // Exemplo, pegar do input real
    localStorage.setItem('alarmeHorario', horarioSelecionado);
    alert('Alarme salvo com sucesso!');
    location.reload();  // Atualiza a página após salvar o alarme
}

// Adiciona o evento ao botão de salvar alarme
document.getElementById('salvar-alarme').addEventListener('click', salvarAlarme);

// Solicita permissão para notificações ao carregar a página
document.addEventListener('DOMContentLoaded', requestNotificationPermission);

// Função para carregar o horário de alarme salvo do localStorage
function carregarAlarmeSalvo() {
    const alarmeHorario = localStorage.getItem('alarmeHorario');
    const alarmeDias = localStorage.getItem('alarmeDias');
    const horarioSalvoP = document.getElementById('horario-salvo');
    const horarioAlarmeSpan = document.getElementById('horario-alarme');
    const limparAlarmeBtn = document.getElementById('limpar-alarme');

    if (alarmeHorario) {
        horarioSalvoP.style.display = 'block';
        limparAlarmeBtn.style.display = 'inline-block';
        horarioAlarmeSpan.textContent = `${alarmeHorario} (${alarmeDias === 'todos-dias' ? 'Todos os Dias' : 'Dias da Semana'})`;
    } else {
        horarioSalvoP.style.display = 'none';
        limparAlarmeBtn.style.display = 'none';
    }
}

// Função para limpar o alarme salvo no localStorage
function limparAlarme() {
    localStorage.removeItem('alarmeHorario');
    localStorage.removeItem('alarmeDias');
    carregarAlarmeSalvo();  // Atualiza a exibição após limpar
    alert('Alarme salvo foi removido.');
    // Recarrega a página após salvar o alarme
    location.reload();
}

// Adicionar o evento de clique ao botão Limpar Alarme
document.getElementById('limpar-alarme').addEventListener('click', function(event) {
    event.preventDefault(); // Previne comportamento padrão
    limparAlarme(); // Chama a função para limpar o alarme
});

// Função para limitar a quantidade de caracteres em inputs numéricos
function limitInputLength(input, maxLength) {
    input.addEventListener('input', () => {
        if (input.value.length > maxLength) {
            input.value = input.value.slice(0, maxLength);
        }
    });
}

// Função para carregar dados do localStorage
function loadFromCache() {
    const savedAge = localStorage.getItem('age');
    const savedFallAsleepTime = localStorage.getItem('fallAsleepTime');

    if (savedAge) document.getElementById('age').value = savedAge;
    if (savedFallAsleepTime) document.getElementById('fall-asleep-time').value = savedFallAsleepTime;
}

// Função para carregar as configurações de alarme do localStorage
function carregarAlarme() {
    const horarioSalvo = localStorage.getItem('alarmeHorario');
    const diasSalvos = localStorage.getItem('alarmeDias');

    if (horarioSalvo) {
        const radios = document.querySelectorAll('input[name="horario"]');
        radios.forEach(radio => {
            if (radio.value === horarioSalvo) radio.checked = true;
        });
    }

    if (diasSalvos) {
        document.getElementById('dias-semana').value = diasSalvos;
    }
}

// Função para salvar o alarme no localStorage
function salvarAlarme() {
    const horarioSelecionado = document.querySelector('input[name="horario"]:checked');
    if (!horarioSelecionado) {
        alert('Por favor, selecione um horário.');
        return;
    }

    const diasSemana = document.getElementById('dias-semana').value;
    const horario = horarioSelecionado.value;

    // Salva no localStorage
    localStorage.setItem('alarmeHorario', horario);
    localStorage.setItem('alarmeDias', diasSemana);

    alert('Alarme salvo com sucesso!');
    carregarAlarmeSalvo(); // Atualiza a exibição logo após salvar
    
    // Recarrega a página após salvar o alarme
    location.reload();
}
// Função para calcular e exibir os horários possíveis
function calcularEExibirHorarios(wakeTimes) {
    const escolherHorarioDiv = document.getElementById('escolher-horario');
    escolherHorarioDiv.innerHTML = ''; // Limpar seleções anteriores

    wakeTimes.forEach(wakeTime => {
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'horario';
        radioInput.value = wakeTime.time;
        radioInput.id = `radio-${wakeTime.cycles}`;
        
        const label = document.createElement('label');
        label.setAttribute('for', radioInput.id);
        label.innerHTML = `Ciclo ${wakeTime.cycles}: ${wakeTime.time} (${wakeTime.duration})`;

        const indicator = document.createElement('span');
        indicator.classList.add('indicator', wakeTime.indicator); // Adiciona a classe de cor correspondente

        const div = document.createElement('div');
        div.classList.add('result-item'); // Classe para alinhar os itens
        div.appendChild(radioInput);
        div.appendChild(indicator);
        div.appendChild(label);

        escolherHorarioDiv.appendChild(div);
    });

    // Adicionar a legenda abaixo dos resultados
    addLegend();
}

// Função para adicionar a legenda abaixo do botão Salvar Alarme
function addLegend() {
    const legendContainer = document.getElementById('legend-container');
    legendContainer.innerHTML = ''; // Limpar a legenda anterior
    
    const legend = document.createElement('div');
    legend.classList.add('legend');

    legend.innerHTML = `
        <h3>Legenda:</h3>
        <div class="legend-item">
            <span class="legend-color green"></span><p>Dentro do intervalo ideal</p>
        </div>
        <div class="legend-item">
            <span class="legend-color yellow"></span><p>Regular (Um pouco acima do ideal)</p>
        </div>
        <div class="legend-item">
            <span class="legend-color orange"></span><p>Ruim (Abaixo do ideal, mas não tão ruim)</p>
        </div>
        <div class="legend-item">
            <span class="legend-color red"></span><p>Péssimo (Muito abaixo/acima do ideal)</p>
        </div>
    `;
    
    legendContainer.appendChild(legend);
}
    
// Função para calcular os horários de despertar e preencher os resultados
function calculateWakeTimes() {
    const ageInput = parseInt(document.getElementById('age').value);
    const sleepHoursInput = parseInt(document.getElementById('sleep-hours').value);
    const sleepMinutesInput = parseInt(document.getElementById('sleep-minutes').value);
    const fallAsleepTimeInput = parseInt(document.getElementById('fall-asleep-time').value) || 0;
    const wakeHoursInput = parseInt(document.getElementById('wake-hours').value);
    const wakeMinutesInput = parseInt(document.getElementById('wake-minutes').value);
    const resultsList = document.getElementById('results');
    const sleepRecommendation = document.getElementById('sleep-recommendation');
    const alarmeConfig = document.querySelector('.alarme-config'); // Seleciona a div de configuração do alarme

    // Salvar idade e tempo médio para adormecer no localStorage
    localStorage.setItem('age', ageInput);
    localStorage.setItem('fallAsleepTime', fallAsleepTimeInput);

    // Limpa os resultados anteriores
    resultsList.innerHTML = '';
    sleepRecommendation.style.display = 'none';

    // Verificar se todos os campos foram preenchidos corretamente
    if (isNaN(ageInput) || isNaN(sleepHoursInput) || isNaN(sleepMinutesInput) || isNaN(wakeHoursInput) || isNaN(wakeMinutesInput)) {
        alert('Por favor, preencha todos os campos corretamente!');
        return;
    }

    // Verificar se os valores dos horários estão dentro dos limites esperados
    if (sleepHoursInput < 0 || sleepHoursInput > 23 || sleepMinutesInput < 0 || sleepMinutesInput > 59) {
        alert('Por favor, insira um horário válido para dormir!');
        return;
    }
    if (wakeHoursInput < 0 || wakeHoursInput > 23 || wakeMinutesInput < 0 || wakeMinutesInput > 59) {
        alert('Por favor, insira um horário válido para acordar!');
        return;
    }

    // Tabela de horas ideais por idade
    const sleepNeeds = [
        { min: 0, max: 3, idealMin: 14, idealMax: 17 },
        { min: 4, max: 11, idealMin: 12, idealMax: 15 },
        { min: 1, max: 2, idealMin: 11, idealMax: 14 },
        { min: 3, max: 5, idealMin: 10, idealMax: 13 },
        { min: 6, max: 13, idealMin: 9, idealMax: 11 },
        { min: 14, max: 17, idealMin: 8, idealMax: 10 },
        { min: 18, max: 64, idealMin: 7, idealMax: 9 },
        { min: 65, max: 150, idealMin: 7, idealMax: 8 }
    ];

    // Determina a necessidade de sono com base na idade
    const sleepRequirement = sleepNeeds.find(range => ageInput >= range.min && ageInput <= range.max);
    if (!sleepRequirement) {
        alert('Idade fora do alcance válido.');
        return;
    }

    // Exibe a recomendação com base na faixa etária
    sleepRecommendation.innerText = `De acordo com a sua faixa etária (${ageInput} anos), suas horas de sono ideais são entre ${sleepRequirement.idealMin} - ${sleepRequirement.idealMax} horas.`;
    sleepRecommendation.style.display = 'block';

    // Conversão de horário de dormir e acordar para objetos Date
    const sleepTime = new Date();
    sleepTime.setHours(sleepHoursInput);
    sleepTime.setMinutes(sleepMinutesInput + fallAsleepTimeInput);

    const wakeTime = new Date();
    wakeTime.setHours(wakeHoursInput);
    wakeTime.setMinutes(wakeMinutesInput);

    // Ajusta para o dia seguinte se o horário de acordar for antes do de dormir
    if (wakeTime <= sleepTime) {
        wakeTime.setDate(wakeTime.getDate() + 1);
    }

    // Duração de um ciclo de sono (90 minutos)
    const cycleDuration = 90 * 60 * 1000;
    const wakeTimes = [];
    let cycleIndex = 1;
    let potentialWakeTime = new Date(sleepTime);

    // Calcula horários ideais de acordar até o horário final especificado pelo usuário
    while (potentialWakeTime <= wakeTime) {
        potentialWakeTime = new Date(sleepTime.getTime() + cycleIndex * cycleDuration);
        if (potentialWakeTime <= wakeTime) {
            const formattedTime = potentialWakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sleepDuration = calculateSleepDuration(sleepTime, potentialWakeTime);

            // Define o indicador de qualidade com base na quantidade de horas de sono
            const indicatorColor = getSleepIndicatorColor(sleepDuration.totalHours, sleepRequirement);

            wakeTimes.push({
                time: formattedTime,
                cycles: cycleIndex,
                duration: `${sleepDuration.hours}h ${sleepDuration.minutes}m`,
                indicator: indicatorColor
            });
        }
        cycleIndex++;
    }

    // Exibir os horários calculados e permitir seleção
    calcularEExibirHorarios(wakeTimes);

    // Mostrar a seção de alarme
    document.querySelector('.alarme-config').style.display = 'block';
    alarmeConfig.style.display = 'block'; // Mostra a seção de configuração do alarme
}

// Função para calcular a duração do sono
function calculateSleepDuration(start, end) {
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return { totalHours: hours + (minutes / 60), hours, minutes };
}

// Função para determinar a cor do indicador de acordo com a duração do sono
function getSleepIndicatorColor(totalHours, sleepRequirement) {
    if (totalHours < sleepRequirement.idealMin - 1) {
        return 'red'; // Muito abaixo do ideal
    } else if (totalHours >= sleepRequirement.idealMin - 1 && totalHours < sleepRequirement.idealMin) {
        return 'orange'; // Abaixo do ideal, mas não tão ruim
    } else if (totalHours >= sleepRequirement.idealMin && totalHours <= sleepRequirement.idealMax) {
        return 'green'; // Dentro do ideal
    } else if (totalHours > sleepRequirement.idealMax && totalHours <= sleepRequirement.idealMax + 1) {
        return 'yellow'; // Um pouco acima do ideal
    } else {
        return 'red'; // Muito acima do ideal
    }
}

// Inicializa a aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    const salvarAlarmeBtn = document.getElementById('salvar-alarme');
    salvarAlarmeBtn.addEventListener('click', salvarAlarme);

    // Limitar caracteres nos inputs
    limitInputLength(document.getElementById('age'), 3);
    limitInputLength(document.getElementById('fall-asleep-time'), 3);

    const timeInputs = ['sleep-hours', 'sleep-minutes', 'wake-hours', 'wake-minutes'].map(id => document.getElementById(id));
    timeInputs.forEach(input => limitInputLength(input, 2));

        // Verifica se o botão foi encontrado no DOM
        if (salvarAlarmeBtn) {
            salvarAlarmeBtn.addEventListener('click', salvarAlarme);
        } else {
            console.error("Botão de salvar alarme não encontrado.");
        }

    // Carregar dados do cache e alarme
    loadFromCache();
    carregarAlarme();
    carregarAlarmeSalvo();  // Exibir horário salvo no topo se existir
});
