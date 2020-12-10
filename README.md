<!-- [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) -->

# Beautify ADVPL/TLPP

Embelezador de código ADVPL/TLPP para ter uma visão mais legível.

## Uso
1. Selecione a parte do código que deseja indentar.
2. Ative o menu de contexto (clique direito), o atalho do teclado, ou o comando

| Comando                      	  | Mac OSX             | Windows/Linux        	|
|---------------------------------|---------------------|----------------------	|
| Beautify AdvPL                  | `CMD+i CMD+a`       | `CTRL+i CTRL+a`      	|
| Beautify AdvPL Ordem Alfabética | `CMD+i CMD+SHIFT+a` | `CTRL+i CTRL+SHIFT+a`	|
| Resetar Indentação              | `CMD+i CMD+s`       | `CTRL+i CTRL+s`      	|

## Recursos

Esta extensão vai facilitar a visualização do seu código, tornando-o mais legível. Ela vai realizar a indentação dos seguintes identificadores:

| Descrição   | Exemplo                        
|-------------|--------------------------------
| Atribuição  | `local aVar := {} as array`
| Arrays  	  | `{a, b, c, d}`
| Métodos New | `TRCell():New(oSec, "A1_COD","SA1")`
| AADD        | `aadd(aArray, {nPar1, cPar2})`


*Futuramente mais identificadores poderão ser adicionados.*

As seguintes indentações estão disponíveis:

### Beautify AdvPL
![left-justified](docs/indent.gif)

### Beautify AdvPL com ordenação alfabética
![left-justified](docs/indent-alpha.gif)

### Reset Indentação
![left-justified](docs/indent-reset.gif)


## Erros conhecidos

Caso encontre, nos avise.

## Notas de Release

[Veja o CHANGELOG para detalhes](./CHANGELOG.md)