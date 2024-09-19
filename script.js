// Função para limitar a quantidade de caracteres em inputs numéricos
function limitInputLength(input, maxLength) {
    input.addEventListener('input', () => {
        if (input.value.length > maxLength) {
            input.value = input.value.slice(0, maxLength);
        }
    });
}

// Adiciona restrições aos campos de entrada
document.addEventListener('DOMContentLoaded', () => {
    // Limitar idade a 3 caracteres
    limitInputLength(document.getElementById('age'), 3);

    // Limitar horas e minutos a 2 caracteres
    const timeInputs = [
        document.getElementById('sleep-hours'),
        document.getElementById('sleep-minutes'),
        document.getElementById('wake-hours'),
        document.getElementById('wake-minutes')
    ];

    timeInputs.forEach(input => limitInputLength(input, 2));

    // Limitar o tempo para adormecer a 3 caracteres
    limitInputLength(document.getElementById('fall-asleep-time'), 3);
});

function calculateWakeTimes() {
    const ageInput = parseInt(document.getElementById('age').value);
    const sleepHoursInput = parseInt(document.getElementById('sleep-hours').value);
    const sleepMinutesInput = parseInt(document.getElementById('sleep-minutes').value);
    const fallAsleepTimeInput = parseInt(document.getElementById('fall-asleep-time').value) || 0;
    const wakeHoursInput = parseInt(document.getElementById('wake-hours').value);
    const wakeMinutesInput = parseInt(document.getElementById('wake-minutes').value);
    const resultsList = document.getElementById('results');
    const resultsHeading = document.getElementById('results-heading');
    const sleepRecommendation = document.getElementById('sleep-recommendation');

    // Limpa os resultados anteriores
    resultsList.innerHTML = '';
    resultsHeading.style.display = 'none';
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

    // Preencher a frase de recomendação com base na faixa etária
    sleepRecommendation.innerText = `De acordo com a sua faixa etária (${ageInput} anos), suas horas de sono ideais são entre ${sleepRequirement.idealMin} - ${sleepRequirement.idealMax} horas.`;
    sleepRecommendation.style.display = 'block'; // Mostra a frase

    // Conversão de horário de dormir e acordar para objetos Date
    const sleepTime = new Date();
    sleepTime.setHours(sleepHoursInput);
    sleepTime.setMinutes(sleepMinutesInput + fallAsleepTimeInput); // Adiciona tempo de adormecer
    sleepTime.setSeconds(0);

    const wakeTime = new Date();
    wakeTime.setHours(wakeHoursInput);
    wakeTime.setMinutes(wakeMinutesInput);
    wakeTime.setSeconds(0);

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
            
            // Calcular a quantidade de horas de sono
            const sleepDuration = calculateSleepDuration(sleepTime, potentialWakeTime);

            // Define o indicador com base na quantidade de horas de sono
            let indicatorColor = getSleepIndicatorColor(sleepDuration.totalHours, sleepRequirement);

            wakeTimes.push({
                time: formattedTime,
                cycles: cycleIndex,
                duration: `${sleepDuration.hours}h ${sleepDuration.minutes}m`,
                indicator: indicatorColor
            });
        }
        cycleIndex++;
    }

    // Exibir resultados com indicadores de qualidade e duração do sono
    if (wakeTimes.length > 0) {
        wakeTimes.forEach(wakeTime => {
            const listItem = document.createElement('li');
            listItem.classList.add('result-item');

            // Cria o indicador de cor
            const indicator = document.createElement('span');
            indicator.classList.add('indicator', wakeTime.indicator);  // Adiciona a classe de cor

            // Cria o conteúdo do horário de acordar
            const cycleInfo = document.createElement('div');
            cycleInfo.innerHTML = `Ciclo ${wakeTime.cycles}: ${wakeTime.time} (${wakeTime.duration})`; // Exibe o horário e a duração do sono

            // Adiciona o indicador e o conteúdo ao item da lista
            listItem.appendChild(indicator);
            listItem.appendChild(cycleInfo);
            resultsList.appendChild(listItem);
        });

        // Exibe a frase "Melhores horários para acordar" após gerar os resultados
        resultsHeading.style.display = 'block';

        // Adiciona a legenda dos indicadores após os resultados
        addLegend();
    } else {
        resultsList.innerHTML = "<p>Não há horários ideais para acordar dentro do intervalo especificado.</p>";
    }
}

// Função para calcular a duração do sono em horas e minutos
function calculateSleepDuration(start, end) {
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return { totalHours: hours + (minutes / 60), hours, minutes }; // Retorna as horas totais e a formatação separada
}

// Função para determinar a cor do indicador com base na duração do sono
function getSleepIndicatorColor(totalHours, sleepRequirement) {
    if (totalHours < sleepRequirement.idealMin - 1) {
        return 'red'; // Muito abaixo do ideal mínimo
    } else if (totalHours >= sleepRequirement.idealMin - 1 && totalHours < sleepRequirement.idealMin) {
        return 'orange'; // Abaixo do ideal, mas não tão ruim
    } else if (totalHours >= sleepRequirement.idealMin && totalHours <= sleepRequirement.idealMax) {
        return 'green'; // Dentro do intervalo ideal
    } else if (totalHours > sleepRequirement.idealMax && totalHours <= sleepRequirement.idealMax + 1) {
        return 'yellow'; // Um pouco acima do ideal
    } else {
        return 'red'; // Muito acima do ideal máximo
    }
}

// Função para adicionar a legenda abaixo dos resultados
function addLegend() {
    const resultsList = document.getElementById('results');
    
    // Cria a legenda
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
    
    resultsList.appendChild(legend);
}
