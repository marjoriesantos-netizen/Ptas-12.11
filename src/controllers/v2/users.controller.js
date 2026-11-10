import { toUserDTO } from "../../dtos/user.dto.js";
import { UsersService } from "../../services/users.service.js";

const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

/**
 * Normaliza page/perPage sem confiar no query string.
 * Valores inválidos caem no padrão em vez de gerar erro.
 */
const parsePagination = (query) => {
  const rawPage = Number.parseInt(String(query.page ?? "1"), 10);
  const rawPerPage = Number.parseInt(String(query.perPage ?? DEFAULT_PER_PAGE), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const perPage =
    Number.isFinite(rawPerPage) && rawPerPage > 0
      ? Math.min(rawPerPage, MAX_PER_PAGE)
      : DEFAULT_PER_PAGE;

  return { page, perPage };
};

const envelope = (data, meta = {}) => ({
  data,
  meta: { version: "v2", ...meta },
});

export const listar = async (req, res, next) => {
  try {
    const { page, perPage } = parsePagination(req.query);
    const users = await UsersService.listar();

    const total = users.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const data = users.slice(start, start + perPage).map(toUserDTO);

    res.status(200).json(
      envelope(data, {
        total,
        page,
        perPage,
        totalPages,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const user = await UsersService.buscarPorId(req.params.id);
    res.status(200).json(envelope(toUserDTO(user)));
  } catch (error) {
    next(error);
  }
};

export const criar = async (req, res, next) => {
  try {
    const user = await UsersService.criar(req.body);
    res.status(201).json(envelope(toUserDTO(user)));
  } catch (error) {
    next(error);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const user = await UsersService.atualizar(req.params.id, req.body);
    res.status(200).json(envelope(toUserDTO(user)));
  } catch (error) {
    next(error);
  }
};

export const remover = async (req, res, next) => {
  try {
    await UsersService.remover(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
