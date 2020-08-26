# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# [2.2.0](https://github.com/rodrigopg/vscode-extension-readable-indent/compare/v2.1.0...v2.2.0) (2020-08-26)


### Bug Fixes

* correção de espaço extra em comentários ([7921d5c](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/7921d5cf3aa6f8f3644709505e868d572559c1b7))
* Correção na indentação com variados pivôs (:= += -=) estava substituindo incorretamente, correção na indentação com vírgulas ([f46b99e](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/f46b99ee684bcd4b9c3355ddedaa7277c40a8dc0))
* Correção para evitar múltiplas ocorrências em identificadores que só podem ser indentados uma única vez. ([081357f](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/081357f599b4a6181bb7b0e45b2967a731e09818))
* Organização de código ([39ccd35](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/39ccd35fad63b23471b3335bc06291b467d30ab4))


### Features

* Nova opção de reset da indentação, remove a indentação do código selecionado. Pode ser acionado pelo atalho --> CTRL+I CTRL+S ([caf3137](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/caf3137d5ab08ba295247d90421d7ec3aad385c1))



# [2.1.0](https://github.com/rodrigopg/vscode-extension-readable-indent/compare/v2.0.3...v2.1.0) (2020-04-22)


### Bug Fixes

* Correção na ordenação ignorando o case sensitive. ([8949e48](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/8949e48b2dd8e2e6fccee351a525959527284718))


### Features

* Criada ordem de prioridades, respeitando escopo de variáveis ([3a8b509](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/3a8b509c0b933110d81e5313aa3f8c17e9659dbf))
* Quando pivot é alfanumérico `Ex: as`, considera palavra inteira, evitando correspondência errada. ([9f0fa35](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/9f0fa3551bed5c46ca84b1e4f8288b35441682be))



## [2.0.3](https://github.com/rodrigopg/vscode-extension-readable-indent/compare/v2.0.2...v2.0.3) (2020-04-21)


### Bug Fixes

* Correção de versão ([68f548e](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/68f548eea4ce9aa04517f8b8cb9413f0f05a6040))
* correção no changelog ([e906cd4](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/e906cd4c632289e666e26240eca4513c7f389387))
* **alpha:** Correção para manter o tipo default sempre após a criação das variáveis ([42bba9a](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/42bba9a4c82c31269d9289deac1e8e552c58ac4b))



## [2.0.2](https://github.com/rodrigopg/vscode-extension-readable-indent/compare/v2.0.1...v2.0.2) (2020-04-21)


### Features

* Incluído pivot `as`


## [2.0.1](https://github.com/rodrigopg/vscode-extension-readable-indent/compare/v1.2.1...v2.0.1) (2020-04-20)


### Bug Fixes

* npm audit fixes ([97860ff](https://github.com/rodrigopg/vscode-extension-readable-indent/commit/97860ff183a2fa76fded23402d8691b86a6f0998))
