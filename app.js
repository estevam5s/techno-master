const vm = new Vue({

    el: "#app",

    data: {
        produtos: [],
        produto: false,
        carrinho: [],
        mensagemAlerta: "Item adicionado",
        carrinhoAtivo: false,
        alertaAtivo: false,
    },

    filters: {
        // Transforma um número no formato da moeda [pt-br]
        numeroPreco(valor) {
            const formatter = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL' 
            });
            return formatter.format(valor);
        }
    },

    computed: {
        // Atualiza o valor total do carrinho
        carrinhoTotal() {
            let total = 0
            if(this.carrinho.length)
                this.carrinho.forEach(item => {
                    total += item.preco
                });
            return total
        }
    },

    watch: {
        // Salva no local storage a cada atualização no carrinho
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho)
        },

        // Modifica a URL e o título da página
        produto() {
            document.title = this.produto.nome || "Techno"
            const hash = this.produto.id  || ""
            history.pushState(null, null, `#${hash}`)
            if(this.produto) this.compararEstoque()
        }
    },

    methods: {
        // Puxa os produtos 
        fetchProdutos() {
            fetch('./api/produtos.json')
                .then( response => response.json())
                .then( json => this.produtos = json)
        },

        // Puxa um produto específico pelo id
        fetchProduto(id) {
            fetch(`./api/produtos/${id}/dados.json`)
                .then( response => response.json())
                .then( json =>  this.produto = json)
        },

        // Fecha a modal ao se clicar fora dela
        fecharModal({ target, currentTarget }) {
            if(target === currentTarget) this.produto = false
        },

        //Fecha o carrinho ao clicar fora dele
        fecharCarrinho({ target, currentTarget }) {
            if(target === currentTarget) this.carrinhoAtivo = false
        },

        // Chamado ao abrir a modal
        abrirModal(id) {
            this.fetchProduto(id)
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        },

        // Adiciona o item ao carrinho
        adicionarItem(event) {
            this.produto.estoque--
            const {id, nome, preco} = this.produto
            this.carrinho.push({id, nome, preco})
            this.alerta(`${nome} foi adicionado ao carrinho`)
        },

        // Remove um item do carrinho pelo seu id
        removerItem(index) {
            this.carrinho.splice(index, 1)
        },

        // Verifica se há algo do carrinho salvo no local storage
        checarLocalStorage() {
            if(window.localStorage.carrinho) {
                this.carrinho = JSON.parse(window.localStorage.carrinho)
            }
        },

        // Compara os itens do carrinho com os do estoque, para controlar a quantidade de produtos
        compararEstoque() {
            const itemsCarrinho = this.carrinho.filter( ({id}) => id === this.produto.id )
            this.produto.estoque -= itemsCarrinho.length
        },

        // Constrói o alerta com uma mensagem customizada
        alerta(mensagemAlerta) {
            this.mensagemAlerta = mensagemAlerta
            this.alertaAtivo = true
            setTimeout(() => {
                this.alertaAtivo = false
            },1500)
        },

        // Verifica se na URL há algum id aberto já, para levar direto ao produto daquele id
        router() {
            const hash = document.location.hash
            if(hash)
                this.fetchProduto(hash.replace("#",""))
        }
    },
    
    created() {
        this.fetchProdutos()
        this.checarLocalStorage()
        this.router()
    },
})
