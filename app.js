//!Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");

//!Configurações
//Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
  })
);

app.set("view engine", "handlebars");

//Mongoose
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1:27017/aprendendo")
  .then(() => {
    console.log("conectado ao mongo");
  })
  .catch((erro) => {
    console.log("Erro ao se conectar: " + erro);
  });

//Public
app.use(express.static(path.join(__dirname, "public")));

// app.use((req, res, next) => {
//   console.log("Oi, eu sou um middleware");
//   next();
// });

//!Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoriaPostagem")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe.");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  // Aqui usa o req.params justamente por estar sendo passado como parametro(url) na requisição(busca)
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        // Aqui é usado o "categoria._id" desta forma pois é como está sendo nomeado essa propriedade dentro do banco de dados
        Postagem.find({ categoriaPostagem: categoria._id }) //! pode ser que o meu dê erro aqui < categoriaPostagem >
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os posts!");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe.");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página desta categoria"
      );
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

// app.get("/admin", (req, res) => {
//   res.render("admin/index");
// });
app.use("/admin", admin);

//!Outros
const PORT = "8081";
app.listen(PORT, () => {
  console.log("Servidor rodando");
});
