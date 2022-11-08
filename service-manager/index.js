document.addEventListener('DOMContentLoaded', () => {
    // crear obj
    const UgeritServicios = {
        clienteSeleccion : {
            servicioId: null,
            horarioInteresado: null
        },
        negocio: {
            tiempoEmpieza: null,
            tiempoTermina: null,
        },
        serviciosArr : [],
        initFn : function () {
            // obtener servicios y mostrarlos
            // get services saved & show it
            let serviciosArrLS = sessionStorage.getItem('serviciosArr')?
                                    JSON.parse(sessionStorage.getItem('serviciosArr'))
                                    : [];
            this.serviciosArr = serviciosArrLS;
            // obtener datos del negocio y mostrarlos
            // get bussiness's schedule & show it
            let negocioDatosLS = sessionStorage.getItem('negocio')?
                                    JSON.parse(sessionStorage.getItem('negocio'))
                                    : {
                                        tiempoEmpieza,
                                        tiempoTermina
                                    };
            this.negocio = negocioDatosLS;
            // cargar datos
            // load data
            this.cargarDatosFn();
        },
        reservacionesArr : [],
        mostrarServicioFn : () => {
            // mostrar servicio en DOM
            // show service in DOM
            let templateFinal = ``;
            // ir por cada servicio
            // go for each service
            UgeritServicios.serviciosArr.forEach(serv => {
                templateFinal += `
                <div class="col-12 col-sm-6 px-0" id="${serv.id}">

                    <div class="row w-100 mx-auto shadow py-3 mb-2 bg-light">
                        <span class="col-8 pr-0">
                            <p class="m-0">${serv.nombreServicio}</p>
                            <small class="d-block" style="line-height: 1.2;">
                                ${serv.descripServicio}
                            </small>
                            <div class="d-flex justify-content-between">
                                <p class="m-0">${serv.tiempoServicio} min</p>
                                <p class="m-0">$${serv.precioServicio}</p>
                            </div>
                        </span>
                        <input class="col-4 p-0" type="checkbox" name="serviciosSeleccionados">
                    </div>

                </div>
            `.trim();
            });
            // mostrar en DOM / Show in DOM
            document.getElementById('serviciosList').innerHTML = templateFinal;
        },
        guardarCambiosHorarioFn : function(tiempoEmpieza = null, tiempoTermina = null) {
            if(tiempoEmpieza !== null)
                this.negocio.tiempoEmpieza = tiempoEmpieza;
            if(tiempoTermina !== null)
                this.negocio.tiempoTermina = tiempoTermina;
            // guardar en sesionStorage
            // save in sesionStorage
            sessionStorage.setItem('negocio', JSON.stringify(this.negocio));
            // calculate availability
            this.calcularHorariosDisponiblesFn();
        },
        agregarServicioArrFn : function (ev) {
            let nombreServicio = document.getElementById("nombreServicio").value.trim(),
                descripServicio = document.getElementById("descripServicio").value.trim(),
                precioServicio = document.getElementById("precioServicio").value.trim(),
                tiempoServicio = document.getElementById("tiempoServicio").value.trim();
            // validar datos
            // validate data
            if(
                (nombreServicio == '' || nombreServicio.length < 1)
                || (descripServicio == '' || descripServicio.length < 1)
                || (precioServicio == '' || precioServicio.length < 1)
                || (tiempoServicio == '' || tiempoServicio.length < 1)
            ) return;
            // agregar nuevo servicio
            // add new service
            UgeritServicios.serviciosArr.push({
                id: 'ID'+Math.random().toString().substring(2),
                nombreServicio,
                descripServicio,
                precioServicio,
                tiempoServicio
            });
            // show services in DOM
            this.mostrarServicioFn();
            // guardar en sesionStorage
            // save in sesionStorage
            sessionStorage.setItem('serviciosArr', JSON.stringify(UgeritServicios.serviciosArr));
            // reset form
            ev.target.parentElement.reset();
        },
        cargarDatosFn : function () {
            // show bussiness availability
            if(this.negocio.tiempoEmpieza !== null && this.negocio.tiempoTermina !== null) {
                document.getElementById('tiempoEmpieza').value = this.negocio.tiempoEmpieza;
                document.getElementById('tiempoTermina').value = this.negocio.tiempoTermina;
            }
            // show services in DOM
            this.mostrarServicioFn();
            // calculate availability
            this.calcularHorariosDisponiblesFn();
        },
        calcularHorariosDisponiblesFn : function () {
            console.log(this)
            if(this.negocio.tiempoEmpieza == null || this.negocio.tiempoTermina == null) return;
            // validar si hay horario interesado, si no hay, ocultar btn
            // validate if there is interested schedule, if not, hide btn
            if(this.clienteSeleccion.horarioInteresado == null)
                document.getElementById('agendar').classList.add('d-none')
            else document.getElementById('agendar').classList.remove('d-none');
            // obtener datos y obtener obj Date
            // get data & get obj Date
            let tiempoEmpiezaMoment = moment(this.negocio.tiempoEmpieza, 'HH:mm a'),
                tiempoTerminaMoment = moment(this.negocio.tiempoTermina, 'HH:mm a');
            // pasarlo a Date / set it to Date
            let tiempoEmpiezaDate = tiempoEmpiezaMoment.toDate(),
                tiempoTerminaDate = tiempoTerminaMoment.toDate();
            // obtener horas entre fechas
            // get hours between dates
            let horasDiferencia = tiempoTerminaDate.getHours() - tiempoEmpiezaDate.getHours(),
                minutosDiferencia = tiempoTerminaDate.getMinutes() - tiempoEmpiezaDate.getMinutes();
            let difereciaTotalMinutos = (horasDiferencia*60)+minutosDiferencia;
            // mostrar horarios disponibles por cada 10 minutos de diferencia
            // show availability for each 10 minutes difference
            document.getElementById('lineaDeTiempo').innerHTML = '';
            for (let i = 0; i < (difereciaTotalMinutos/10); i++) {
                console.log(i)
                // validar si ya esta reservado
                // validate if there is something reserved
                let reservado = this.reservacionesArr.find(reserv => 
                    tiempoEmpiezaDate >= reserv.horarioInteresado.tiempoEmpieza
                    && tiempoEmpiezaDate <= reserv.horarioInteresado.tiempoTermina
                );
                // Si el tiempo ya esta reservado, seguir con la siguiente iteracion
                // if schedule is taken, continue with the next iteration
                if(
                    !reservado
                    && new Date() < tiempoEmpiezaDate 
                ) {
                    // mostrar tiempo interesado / show interested schedule
                    if(
                        this.clienteSeleccion.horarioInteresado !== null 
                        && tiempoEmpiezaDate >= this.clienteSeleccion.horarioInteresado.tiempoEmpieza
                        && tiempoEmpiezaDate <= this.clienteSeleccion.horarioInteresado.tiempoTermina
                    ) {
                        // mostrar/show template
                        // accion = 'tiempoInteresado'
                        document.getElementById('lineaDeTiempo').innerHTML += `
                            <div id="ID${moment(tiempoEmpiezaDate).format('HHmm')}" class="btn btn-dark btn-block">
                                ${moment(tiempoEmpiezaDate).format('hh:mm a')}
                            </div>
                        `.trim();
                    } else {
                        // mostrar/show template
                        // accion = 'tiempoInteresado'
                        document.getElementById('lineaDeTiempo').innerHTML += `
                            <div id="ID${moment(tiempoEmpiezaDate).format('HHmm')}" class="btn btn-info btn-block">
                                ${moment(tiempoEmpiezaDate).format('hh:mm a')}
                            </div>
                        `.trim();
                    }
                } 
                // sumar 10 minutos
                // plus 10 minutes
                tiempoEmpiezaDate.setMinutes(tiempoEmpiezaDate.getMinutes() + 10);
            }
            // actualizar/update agenda
            this.actualizarAgendaFn();
        },
        agregarReservacionFn : function () {
            // agregar reservacion / add new reservation
            this.reservacionesArr.push({
                reservacionId: `ID${moment(this.clienteSeleccion.horarioInteresado.tiempoEmpieza).format('HHmm')}`,
                servicioId: this.clienteSeleccion.servicioId,
                horarioInteresado: this.clienteSeleccion.horarioInteresado
            });
            // resetear reservacion interesada / reset interested reservation
            this.clienteSeleccion.horarioInteresado = null;
            // mostrar nuevos disponibilidad / show new agenda available
            this.calcularHorariosDisponiblesFn();
        },
        actualizarAgendaFn : function () {
            let agendaHtm = document.getElementById('agenda');
            // organizar agenda / organize agenda
            this.reservacionesArr.sort((a, b) => a.horarioInteresado.tiempoEmpieza < b.horarioInteresado.tiempoEmpieza).reverse();
            // actualizar/update agenda
            agendaHtm.innerHTML = '';
            this.reservacionesArr.forEach(reserv => {
                // obtener servicio
                // get service
                let servicio = this.serviciosArr.find(serv => reserv.servicioId == serv.id);
                agendaHtm.innerHTML += `
                    <div class="card rounded mb-2">
                        <div class="px-2 py-4 row w-100 mx-auto">
                            <div class="col-9 p-0">
                                <p class="m-0">${servicio.nombreServicio}</p>
                                <p class="font-weight-bold m-0">
                                    ${moment(reserv.horarioInteresado.tiempoEmpieza).format('hh:mm a')} - ${moment(reserv.horarioInteresado.tiempoTermina).format('hh:mm a')}
                                </p>
                            </div>
                            <div class="col-3 pr-0 d-flex align-items-center">
                                <p class="m-0">$${servicio.precioServicio}</p>
                            </div>
                        </div>
                    </div>
                `.trim();
            });
        }
    }
    //-------------------------------------------
    // inicializar
    UgeritServicios.initFn();
    //---- Eventlistener ------------------------
    // actualizar horari
    document.getElementById('horarioNegocio').addEventListener('input', ev => {
        console.log(ev.target.id)
        if(ev.target.id == 'tiempoEmpieza')
            UgeritServicios.guardarCambiosHorarioFn(ev.target.value, null);
        if(ev.target.id == 'tiempoTermina')
            UgeritServicios.guardarCambiosHorarioFn(null, ev.target.value);
    });
    // agregar nuevo Serv
    document.querySelector('#nuevoServicio button').addEventListener('click', ev => UgeritServicios.agregarServicioArrFn(ev));
    // detectar serv tomado
    document.getElementById('serviciosList').addEventListener('click', ev => {
        if(ev.target.tagName == 'INPUT')
            UgeritServicios.clienteSeleccion.servicioId = ev.target.parentElement.parentElement.id;
    });
    // detectar horario / detect schedule
    document.getElementById('lineaDeTiempo').addEventListener('click', ev => {
        let servicioDatos = UgeritServicios.serviciosArr.find(serv => 
            UgeritServicios.clienteSeleccion.servicioId == serv.id
        );
        if(!servicioDatos) return;
        // filtrar datos / filter data
        let horarioMoment = moment(ev.target.id.substring(2), 'HHmm'),
            tiempoTerminaDate = horarioMoment.toDate();
            // sumar minutos del servicio
            // plus service's minutes
            tiempoTerminaDate.setMinutes(tiempoTerminaDate.getMinutes() + Number(servicioDatos.tiempoServicio));
        // guardar horario interesado en formato Date
        // save wanted schedule in Date format
        UgeritServicios.clienteSeleccion.horarioInteresado = {
            tiempoEmpieza: horarioMoment.toDate(),
            tiempoTermina: tiempoTerminaDate
        };
        // calculate availability
        UgeritServicios.calcularHorariosDisponiblesFn();
    });
    // confirmar horario / confirm schedule
    document.getElementById('agendar').addEventListener('click', () =>
        UgeritServicios.agregarReservacionFn()
    );
});